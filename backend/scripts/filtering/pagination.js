import { check } from 'k6';
import { URL } from 'https://jslib.k6.io/url/1.0.0/index.js';
import http from 'k6/http';

export const options = {
    thresholds: {
        http_req_failed: ['rate<0.01'],     // http errors should be less than 1%
        http_req_duration: ['p(95)<1000'],  // 95% of requests should be below 1s
    },
    scenarios: {
        contacts: {
            executor: 'constant-arrival-rate',

            // How long the test lasts
            duration: '3s',

            // How many iterations per timeUnit
            rate: 100,

            // Start `rate` iterations per second
            timeUnit: '1s',

            // Pre-allocate 2 VUs before starting the test
            preAllocatedVUs: 100,

            // Spin up a maximum of 50 VUs to sustain the defined constant arrival rate.
            maxVUs: 100,
        },
  },
};

export default function() {
    let page = 0;
    let response = undefined;

    while (response === undefined || (response && response.length > 0)) {
        const url = new URL("http://localhost:8080/videos");
        url.searchParams.append("page", page);

        const res = http.get(url.toString());
        response = res.json();

        check(res, {
            "response code was 200": (res) => res.status === 200,
        });

        page += 1;
    }
}
