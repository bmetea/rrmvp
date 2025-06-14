import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomIntBetween } from 'https://jslib.k6.io/k6-utils/1.2.0/index.js';

// Test configuration
export const options = {
  stages: [
    { duration: '30s', target: 2000 },  // Ramp up to 20 users
    { duration: '2m', target: 2000 },   // Stay at 20 users for 2 minutes
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% of requests should fail
  },
};

// Test setup
const BASE_URL = 'https://d1ah76inu5itvn.cloudfront.net';

// Define all the pages to test
const PAGES = [
  '/',
  '/competitions'
];

// Simulate real user behavior with random delays
function simulateUserBehavior() {
  // Randomly select a page to visit
  const page = PAGES[randomIntBetween(0, PAGES.length - 1)];
  
  // Visit the page
  const response = http.get(`${BASE_URL}${page}`);
  
  check(response, {
    [`${page} status is 200`]: (r) => r.status === 200,
    [`${page} loads fast`]: (r) => r.timings.duration < 500,
  });

  // Simulate user reading time (between 2 and 5 seconds)
  sleep(randomIntBetween(2, 5));

  // 30% chance to visit competitions page
  if (randomIntBetween(1, 100) <= 30) {
    const compResponse = http.get(`${BASE_URL}/competitions`);
    check(compResponse, {
      'competitions page status is 200': (r) => r.status === 200,
      'competitions page loads fast': (r) => r.timings.duration < 500,
    });
    sleep(randomIntBetween(3, 7)); // Longer stay on competitions page
  }

  // 20% chance to visit checkout page
  if (randomIntBetween(1, 100) <= 20) {
    const checkoutResponse = http.get(`${BASE_URL}/checkout`);
    check(checkoutResponse, {
      'checkout page status is 200': (r) => r.status === 200,
      'checkout page loads fast': (r) => r.timings.duration < 500,
    });
    sleep(randomIntBetween(2, 4));
  }

  // Simulate user scrolling behavior
  sleep(randomIntBetween(1, 3));
}

// Main test function
export default function () {
  // Simulate a user session
  simulateUserBehavior();
  
  // Add a small delay between sessions
  sleep(randomIntBetween(1, 2));
} 