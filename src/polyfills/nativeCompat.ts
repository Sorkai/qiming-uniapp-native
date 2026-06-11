type CloneSeen = Map<object, unknown>;

const runtimeGlobal =
  typeof globalThis !== "undefined" ? (globalThis as any) : (window as any);

if (typeof Object.hasOwn !== "function") {
  Object.defineProperty(Object, "hasOwn", {
    configurable: true,
    writable: true,
    value(object: unknown, property: PropertyKey) {
      if (object == null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }
      return Object.prototype.hasOwnProperty.call(Object(object), property);
    }
  });
}

if (typeof runtimeGlobal.structuredClone !== "function") {
  const objectToString = Object.prototype.toString;

  const cloneValue = <T>(value: T, seen: CloneSeen): T => {
    if (value === null || typeof value !== "object") return value;

    const source = value as object;
    if (seen.has(source)) return seen.get(source) as T;

    if (value instanceof Date) return new Date(value.getTime()) as T;
    if (value instanceof RegExp) {
      const regexp = new RegExp(value.source, value.flags);
      regexp.lastIndex = value.lastIndex;
      return regexp as T;
    }
    if (typeof Blob !== "undefined" && value instanceof Blob) {
      return value.slice(0, value.size, value.type) as T;
    }
    if (typeof File !== "undefined" && value instanceof File) {
      return new File([value], value.name, {
        type: value.type,
        lastModified: value.lastModified
      }) as T;
    }
    if (typeof ImageData !== "undefined" && value instanceof ImageData) {
      return new ImageData(
        cloneValue(value.data, seen),
        value.width,
        value.height,
        value.colorSpace ? { colorSpace: value.colorSpace } : undefined
      ) as T;
    }
    if (value instanceof ArrayBuffer) return value.slice(0) as T;
    if (ArrayBuffer.isView(value)) {
      const buffer = cloneValue(value.buffer, seen);
      if (value instanceof DataView) {
        return new DataView(buffer, value.byteOffset, value.byteLength) as T;
      }
      return new (value.constructor as any)(
        buffer,
        value.byteOffset,
        "length" in value ? value.length : undefined
      ) as T;
    }
    if (value instanceof Map) {
      const map = new Map();
      seen.set(source, map);
      value.forEach((mapValue, mapKey) => {
        map.set(cloneValue(mapKey, seen), cloneValue(mapValue, seen));
      });
      return map as T;
    }
    if (value instanceof Set) {
      const set = new Set();
      seen.set(source, set);
      value.forEach(setValue => {
        set.add(cloneValue(setValue, seen));
      });
      return set as T;
    }

    const output = Array.isArray(value)
      ? []
      : objectToString.call(value) === "[object Object]"
        ? Object.create(Object.getPrototypeOf(value))
        : {};
    seen.set(source, output);

    Reflect.ownKeys(source).forEach(key => {
      const descriptor = Object.getOwnPropertyDescriptor(source, key);
      if (!descriptor) return;
      if ("value" in descriptor) {
        descriptor.value = cloneValue(descriptor.value, seen);
      }
      try {
        Object.defineProperty(output, key, descriptor);
      } catch {
        (output as Record<PropertyKey, unknown>)[key] = cloneValue(
          (source as Record<PropertyKey, unknown>)[key],
          seen
        );
      }
    });

    return output as T;
  };

  Object.defineProperty(runtimeGlobal, "structuredClone", {
    configurable: true,
    writable: true,
    value<T>(value: T) {
      return cloneValue(value, new Map());
    }
  });
}

if (typeof document !== "undefined") {
  document.documentElement.dataset.qimingCompat = "true";
}
