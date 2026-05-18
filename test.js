const routePath = "/account/ai-app";
let activeRail = routePath.split("/").pop() || "chat";
if (activeRail === "ai-app") {
  activeRail = "chat";
}
console.log(activeRail);
