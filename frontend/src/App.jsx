import { useState, useEffect } from 'react';
import './App.css';

// A URL base da sua API de usuários. Verifique se a porta e o caminho estão corretos.
const API_BASE_URL = 'http://localhost:8000/api/v1/users';

function App() {
  // --- ESTADOS DO COMPONENTE ---
  // Armazena a lista de usuários vinda da API
  const [users, setUsers] = useState([]);
  // Controla se o formulário está em modo de edição ou criação
  const [isEditing, setIsEditing] = useState(false);
  // Armazena os dados do formulário (seja para um novo usuário ou um existente)
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    email: '',
    password: '',
  });

  // --- EFEITOS (HOOKS) ---
  // useEffect com array de dependências vazio executa esta função UMA VEZ
  // quando o componente é montado na tela.
  useEffect(() => {
    fetchUsers();
  }, []);

  // --- FUNÇÕES DE INTERAÇÃO COM A API ---

  // GET / - Busca todos os usuários
  const fetchUsers = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  // POST / ou PUT /{user_id} - Lógica de submissão do formulário
  const handleSubmit = async (e) => {
    e.preventDefault(); // Impede o recarregamento da página

    const url = isEditing
      ? `${API_BASE_URL}/${formData.id}`
      : API_BASE_URL;
    
    const method = isEditing ? 'PUT' : 'POST';

    // Para PUT, não enviamos a senha. Para POST, a senha é necessária.
    const body = isEditing
      ? JSON.stringify({ name: formData.name, email: formData.email })
      : JSON.stringify(formData);

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });

      if (!response.ok) {
        throw new Error('A resposta da rede não foi ok');
      }

      resetForm();
      fetchUsers(); // Atualiza a lista de usuários após a operação
    } catch (error) {
      console.error('Erro ao salvar usuário:', error);
    }
  };

  // DELETE /{user_id} - Deleta um usuário
  const handleDelete = async (userId) => {
    if (window.confirm('Tem certeza que deseja deletar este usuário?')) {
      try {
        await fetch(`${API_BASE_URL}/${userId}`, {
          method: 'DELETE',
        });
        fetchUsers(); // Atualiza a lista
      } catch (error) {
        console.error('Erro ao deletar usuário:', error);
      }
    }
  };

  // --- FUNÇÕES AUXILIARES ---

  // Prepara o formulário para edição
  const handleEdit = (user) => {
    setIsEditing(true);
    setFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      password: '', // Não preenchemos a senha para edição
    });
  };

  // Atualiza o estado do formulário conforme o usuário digita
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  // Limpa o formulário e volta para o modo de criação
  const resetForm = () => {
    setIsEditing(false);
    setFormData({
      id: null,
      name: '',
      email: '',
      password: '',
    });
  };


  // --- RENDERIZAÇÃO DO COMPONENTE (JSX) ---
  return (
    <div className="app-container">
      <h1>Gerenciador de Usuários</h1>

      <div className="form-container">
        <h2>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Nome"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          {/* O campo de senha só aparece no modo de criação */}
          {!isEditing && (
            <input
              type="password"
              name="password"
              placeholder="Senha"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          )}
          <div className="form-buttons">
            <button type="submit">{isEditing ? 'Atualizar' : 'Salvar'}</button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="cancel-btn">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="list-container">
        <h2>Usuários Cadastrados</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td className="actions">
                  <button onClick={() => handleEdit(user)} className="edit-btn">Editar</button>
                  <button onClick={() => handleDelete(user.id)} className="delete-btn">Deletar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
