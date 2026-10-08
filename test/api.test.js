// Smoke / regression tests. Run with: npm test  (uses Node's built-in test runner)
process.env.EMAIL_USER = '';   // force the mock mailer so tests never send real email
process.env.EMAIL_PASS = '';
process.env.JWT_SECRET = 'test-secret';
process.env.REDIS_HOST = '127.0.0.1';
process.env.REDIS_PORT = '1';  // unreachable -> in-memory cache

const test = require('node:test');
const assert = require('node:assert/strict');
const { server } = require('../server');

let base;

test.before(async () => {
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => new Promise((resolve) => server.close(resolve)));

const getJson = async (path, options) => {
  const res = await fetch(base + path, options);
  return { status: res.status, body: await res.json() };
};

const postJson = (path, body, headers = {}) =>
  getJson(path, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body)
  });

test('GET /health returns OK', async () => {
  const { status, body } = await getJson('/health');
  assert.equal(status, 200);
  assert.equal(body.status, 'OK');
});

test('serves the frontend at /', async () => {
  const res = await fetch(base + '/');
  assert.equal(res.status, 200);
  assert.match(await res.text(), /NASA TEMPO Air Quality Monitor/);
});

test('GET /api/air-quality/current returns AQI and pollutants', async () => {
  const { status, body } = await getJson('/api/air-quality/current?lat=40.7128&lng=-74.0060');
  assert.equal(status, 200);
  assert.equal(typeof body.aqi, 'number');
  assert.ok(body.category);
  for (const key of ['pm25', 'pm10', 'ozone', 'no2', 'so2', 'co']) {
    assert.ok(key in body.pollutants, `missing pollutant ${key}`);
  }
});

test('location endpoints reject missing or out-of-range coordinates', async () => {
  assert.equal((await getJson('/api/air-quality/current')).status, 400);
  assert.equal((await getJson('/api/air-quality/current?lat=95&lng=0')).status, 400);
  assert.equal((await getJson('/api/tempo/data?lat=abc&lng=0')).status, 400);
});

test('GET /api/air-quality/ranking returns cities', async () => {
  const { status, body } = await getJson('/api/air-quality/ranking?country=US');
  assert.equal(status, 200);
  assert.ok(JSON.stringify(body).includes('New York'));
});

// Regression: /api/users/* used to return 500 because the service export was a class
test('register -> login -> profile flow works', async () => {
  const email = `test-${Date.now()}@example.com`;
  const reg = await postJson('/api/users/register', { email, password: 'pw-123456', name: 'Test' });
  assert.equal(reg.status, 201);
  assert.ok(reg.body.token);

  const login = await postJson('/api/users/login', { email, password: 'pw-123456' });
  assert.equal(login.status, 200);

  const profile = await getJson('/api/users/profile', {
    headers: { authorization: `Bearer ${login.body.token}` }
  });
  assert.equal(profile.status, 200);
  assert.equal(profile.body.email, email);

  const bad = await postJson('/api/users/login', { email, password: 'wrong' });
  assert.equal(bad.status, 401);
});

test('profile requires a token', async () => {
  assert.equal((await getJson('/api/users/profile')).status, 401);
});

// Subscribing also triggers a welcome notification (mock mailer here)
test('subscribing returns a subscription id', async () => {
  const { status, body } = await postJson('/api/notifications/subscribe', { lat: 40.7, lng: -74 });
  assert.equal(status, 200);
  assert.match(body.subscriptionId, /^sub_/);
});
