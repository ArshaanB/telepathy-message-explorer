export async function getLogs() {
  const result = await fetch("https://docs-demo.quiknode.pro/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      method: "eth_getLogs",
      params: [
        {
          fromBlock: "0x118DF98",
          toBlock: "0x11906A7",
          address: "0x41EA857C32c8Cb42EEFa00AF67862eCFf4eB795a",
          topics: [
            "0xe5944a34d67c652e0ebf2304b48432aae0b55e40f79ba8a21a4d7054c169ffac"
          ]
        }
      ],
      id: 1,
      jsonrpc: "2.0"
    })
  });

  return result.json();
}
