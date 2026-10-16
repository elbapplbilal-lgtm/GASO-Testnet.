// Read-only ERC-4337 bundler capability probe. No wallet/private key required.
// It does NOT send transactions or prove acceptance of our Paymaster.
const endpoint = process.env.BUNDLER_RPC_URL;
if (!endpoint || !/^https:\/\//.test(endpoint)) {
  console.error("Set BUNDLER_RPC_URL to a trusted HTTPS bundler JSON-RPC endpoint.");
  process.exit(1);
}

async function rpc(method, params = []) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(15000)
  });
  if (!response.ok) throw new Error(method + ": HTTP " + response.status);
  const body = await response.json();
  if (body.error) throw new Error(method + ": " + body.error.message);
  return body.result;
}

(async () => {
  // Ethereum ERC-4337 version 0.7 Entrypoint canonical address:
  const expected = "0x0000000071727de22e5e9d8baf0edac6f37da032";
  const supported = await rpc("eth_supportedEntryPoints");
  if (!Array.isArray(supported)) throw new Error("Invalid eth_supportedEntryPoints response");
  console.log("Supported EntryPoints:", supported);
  if (!supported.some(a => typeof a === "string" && a.toLowerCase() === expected)) {
    throw new Error("This bundler does not advertise ERC-4337 EntryPoint v0.7");
  }
  console.log("PASS: Bundler advertises EntryPoint v0.7");
  console.log("Still untested: Paymaster-specific UserOperation validation, submission and receipt.");
})().catch(e => {
  console.error("Bundler probe failed:", e.message);
  process.exitCode = 1;
});
