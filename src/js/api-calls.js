export async function getRate(base, quote) {
  const url = `https://api.exchangeratesapi.io/latest?base=${base}&symbols=${quote}`;
  const response = await fetch(url);
  if (response.status !== 200) {
    throw new Error(`API Returned ${response.status}`);
  }
  const json = await response.json();
  return { rate: json.rates[quote], time: json.date };
}

export async function getOptions() {
  const url = `https://api.exchangeratesapi.io/latest`;
  const response = await fetch(url);
  if (response.status !== 200) {
    throw new Error(`API Returned ${response.status}`);
  }
  const json = await response.json();
  const arr = Object.keys(json.rates);
  arr.push(json.base);
  return arr.sort()
}
