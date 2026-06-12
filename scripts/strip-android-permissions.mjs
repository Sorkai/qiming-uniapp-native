import { readFileSync, writeFileSync } from "node:fs";

const inputPath = process.argv[2];
const outputPath = process.argv[3] || inputPath;

if (!inputPath) {
  console.error("Usage: node scripts/strip-android-permissions.mjs <AndroidManifest.xml> [output]");
  process.exit(2);
}

const keepPermissions = new Set([
  "android.permission.ACCESS_NETWORK_STATE",
  "android.permission.ACCESS_WIFI_STATE",
  "android.permission.CAMERA",
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.INTERNET",
  "android.permission.MODIFY_AUDIO_SETTINGS",
  "android.permission.POST_NOTIFICATIONS",
  "android.permission.READ_EXTERNAL_STORAGE",
  "android.permission.READ_MEDIA_IMAGES",
  "android.permission.READ_MEDIA_VIDEO",
  "android.permission.RECORD_AUDIO",
  "android.permission.VIBRATE",
  "android.permission.WRITE_EXTERNAL_STORAGE"
]);

const keepPermissionPrefixes = [
  "io.dcloud.HBuilder.permission.",
  "getui.permission.GetuiService.",
  "com.vivo.notification.permission.",
  "com.google.android.gms.permission.",
  "com.google.android.finsky.permission.",
  "com.asus.msa."
];

const stripMetaDataNames = new Set([
  // HBuilder base APK defaults this to "always", which triggers the startup
  // device-id / phone-number explanation dialog even after READ_PHONE_STATE
  // itself is removed. The app does not need phone-state access.
  "DCLOUD_READ_PHONE_STATE"
]);

function shouldKeepPermission(permission) {
  return (
    keepPermissions.has(permission) ||
    keepPermissionPrefixes.some(prefix => permission.startsWith(prefix))
  );
}

const buffer = readFileSync(inputPath);

function u16(offset) {
  return buffer.readUInt16LE(offset);
}

function u32(offset) {
  return buffer.readUInt32LE(offset);
}

if (u16(0) !== 0x0003) {
  throw new Error("Expected binary XML root chunk.");
}

const strings = [];

function readLength(offset) {
  const first = buffer[offset];
  if ((first & 0x80) !== 0) {
    return {
      value: ((first & 0x7f) << 8) | buffer[offset + 1],
      bytes: 2
    };
  }
  return { value: first, bytes: 1 };
}

function readStringPool(offset) {
  const headerSize = u16(offset + 2);
  const stringCount = u32(offset + 8);
  const flags = u32(offset + 16);
  const stringsStart = u32(offset + 20);
  const isUtf8 = (flags & 0x100) !== 0;

  for (let index = 0; index < stringCount; index += 1) {
    const relativeOffset = u32(offset + headerSize + index * 4);
    let cursor = offset + stringsStart + relativeOffset;
    if (isUtf8) {
      const utf16Length = readLength(cursor);
      cursor += utf16Length.bytes;
      const byteLength = readLength(cursor);
      cursor += byteLength.bytes;
      strings[index] = buffer.toString("utf8", cursor, cursor + byteLength.value);
    } else {
      const length = u16(cursor);
      cursor += 2;
      strings[index] = buffer.toString("utf16le", cursor, cursor + length * 2);
    }
  }
}

function stringAt(index) {
  return index === 0xffffffff ? "" : strings[index] || "";
}

function getElementName(offset) {
  return stringAt(u32(offset + 20));
}

function getAttributeValue(offset, targetName) {
  const attributeStart = u16(offset + 24);
  const attributeSize = u16(offset + 26);
  const attributeCount = u16(offset + 28);

  for (let index = 0; index < attributeCount; index += 1) {
    const attrOffset = offset + 16 + attributeStart + index * attributeSize;
    const name = stringAt(u32(attrOffset + 4));
    if (name !== targetName) continue;

    const rawValue = u32(attrOffset + 8);
    if (rawValue !== 0xffffffff) return stringAt(rawValue);

    const dataType = buffer[attrOffset + 15];
    const data = u32(attrOffset + 16);
    return dataType === 3 ? stringAt(data) : String(data);
  }

  return "";
}

let offset = 8;
let removedCount = 0;
let removedMetaDataCount = 0;
let skipElementDepth = 0;
const chunks = [];

while (offset < buffer.length) {
  const type = u16(offset);
  const size = u32(offset + 4);

  if (size <= 0) {
    throw new Error(`Invalid chunk size at ${offset}: ${size}`);
  }

  if (type === 0x0001) {
    readStringPool(offset);
  }

  if (skipElementDepth > 0) {
    if (type === 0x0102) skipElementDepth += 1;
    if (type === 0x0103) skipElementDepth -= 1;
    offset += size;
    continue;
  }

  let remove = false;
  if (type === 0x0102 && getElementName(offset) === "uses-permission") {
    const permission = getAttributeValue(offset, "name");
    remove = permission.startsWith("android.permission.") && !shouldKeepPermission(permission);
    if (remove) removedCount += 1;
  }
  if (type === 0x0102 && getElementName(offset) === "meta-data") {
    const name = getAttributeValue(offset, "name");
    remove = stripMetaDataNames.has(name);
    if (remove) removedMetaDataCount += 1;
  }

  if (!remove) {
    chunks.push(buffer.subarray(offset, offset + size));
  } else {
    skipElementDepth = 1;
  }

  offset += size;
}

const output = Buffer.concat([buffer.subarray(0, 8), ...chunks]);
output.writeUInt32LE(output.length, 4);
writeFileSync(outputPath, output);

console.log(
  `Stripped ${removedCount} Android permission declaration(s) and ${removedMetaDataCount} DCloud phone-state meta-data declaration(s).`
);
