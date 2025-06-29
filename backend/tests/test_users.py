import pytest
from httpx import AsyncClient
from faker import Faker


# Inicializa o Faker para gerar dados falsos
fake = Faker("pt_BR")

# Marca todos os testes neste arquivo para serem executados com asyncio
pytestmark = pytest.mark.asyncio


async def test_create_user(client: AsyncClient):
    """
    Testa a criação de um novo usuário (POST /api/v1/users/).
    """
    user_data = {
        "name": fake.name(),
        "email": fake.email(),
        "password": "a_secure_password"
    }
    
    response = await client.post("/api/v1/users/", json=user_data)
    
    # Verifica as asserções
    assert response.status_code == 201
    
    response_data = response.json()
    assert response_data["email"] == user_data["email"]
    assert response_data["name"] == user_data["name"]
    assert "id" in response_data

    response = await client.post(f"/api/v1/users/", json = {})
    assert response.status_code == 422, "Deve retornar erro 422 quando os dados estão incompletos"


async def test_read_users(client: AsyncClient):
    """
    Testa a listagem de usuários (GET /api/v1/users/).
    """
    # Primeiro, cria alguns usuários para garantir que a lista não esteja vazia
    for _ in range(3):
        user_data = {
            "name": fake.name(),
            "email": fake.email(),
            "password": "a_secure_password"
        }
        await client.post("/api/v1/users/", json=user_data)
        
    response = await client.get("/api/v1/users/")
    
    # Verifica as asserções
    assert response.status_code == 200
    
    response_data = response.json()
    assert isinstance(response_data, list)
    assert len(response_data) == 3


async def test_update_user(client: AsyncClient):
    """
    Testa a atualização de um usuário existente (PUT /api/v1/users/{user_id}).
    """
    # 1. Cria um usuário
    user_data = {
        "name": fake.name(),
        "email": fake.email(),
        "password": "a_secure_password"
    }
    response = await client.post("/api/v1/users/", json=user_data)
    assert response.status_code == 201
    created_user = response.json()
    user_id = created_user["id"]

    # 2. Atualiza o usuário criado
    new_name = fake.name()
    update_data = {"name": new_name, "email": created_user["email"]}
    
    response = await client.put(f"/api/v1/users/{user_id}", json=update_data)
    
    # 3. Verifica as asserções
    assert response.status_code == 200
    
    updated_user = response.json()
    assert updated_user["id"] == user_id
    assert updated_user["name"] == new_name
    assert updated_user["email"] == created_user["email"]


async def test_delete_user(client: AsyncClient):
    """
    Testa a exclusão de um usuário existente (DELETE /api/v1/users/{user_id}).
    """
    
    # Cria um usuário
    user_data = {
        "name": fake.name(),
        "email": fake.email(),
        "password": "a_secure_password"
    }
    response = await client.post("/api/v1/users/", json = user_data)
    assert response.status_code == 201
    created_user = response.json()
    user_id = created_user["id"]

    # Exclui o usuário criado
    response = await client.delete(f"/api/v1/users/{user_id}")
    assert response.status_code == 204
    
    # 4. Tenta buscar o usuário excluído
    response = await client.get(f"/api/v1/users/{user_id}")
    assert response.status_code == 404
