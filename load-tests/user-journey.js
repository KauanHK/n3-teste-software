// load-tests/user-journey.js (Versão Simplificada)

import http from 'k6/http';
import { check, sleep, group } from 'k6';

// A URL base da sua API continua a mesma
const BASE_URL = 'http://localhost:8000/api/v1';

// A configuração do teste continua a mesma
export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m', target: 10 },
    { duration: '20s', target: 30 },
    { duration: '1m', target: 30 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    'http_req_duration': ['p(95)<500'],
    'http_req_failed': ['rate<0.01'],
    'checks': ['rate>0.99'],
  },
};

// --- O Cenário de Teste Simplificado ---
export default function () {
  // NÃO PRECISAMOS MAIS DO FAKER!
  // Geramos dados únicos usando as variáveis internas do k6: __VU e __ITER
  const uniqueEmail = `user.vu${__VU}.iter${__ITER}@test.com`;
  const userName = `Test User VU=${__VU}`;
  
  const userData = {
    name: userName,
    email: uniqueEmail,
    password: 'a_strong_password_123',
  };
  const headers = { 'Content-Type': 'application/json' };
  let userId;

  group('1. Criar Usuário (POST)', function () {
    const res = http.post(`${BASE_URL}/users/`, JSON.stringify(userData), { headers });
    check(res, {
      'POST /users - status é 201': (r) => r.status === 201,
      'POST /users - corpo da resposta contém ID': (r) => r.json('id') !== null,
    });
    if (res.status === 201) {
      userId = res.json('id');
    }
    sleep(1);
  });

  if (userId) {
    group('2. Atualizar Usuário (PUT)', function () {
      const updateData = {
        name: `Updated User VU=${__VU}`, // Novo nome único
        email: uniqueEmail, // Mantém o email
      };
      const res = http.put(`${BASE_URL}/users/${userId}`, JSON.stringify(updateData), { headers });
      check(res, {
        'PUT /users/{id} - status é 200': (r) => r.status === 200,
        'PUT /users/{id} - nome foi atualizado': (r) => r.json('name') === updateData.name,
      });
      sleep(1);
    });

    group('3. Deletar Usuário (DELETE)', function () {
      const res = http.del(`${BASE_URL}/users/${userId}`);
      check(res, {
        'DELETE /users/{id} - status é 204': (r) => r.status === 204,
      });
      sleep(1);
    });
  }

  group('4. Listar Todos os Usuários (GET)', function () {
    const res = http.get(`${BASE_URL}/users/`);
    check(res, {
      'GET /users - status é 200': (r) => r.status === 200,
    });
    sleep(0.5);
  });
}