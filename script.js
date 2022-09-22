import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '15s', target: 300 },
    // { duration: '1m30s', target: 10 },
    // { duration: '20s', target: 1 },
  ],
};

export default function () {
  const res = http.get('http://localhost:3000/qa/questions/2/answers?page=0&count=100');
  check(res, { 'status was 200': (r) => r.status == 200 });
  sleep(1);
}