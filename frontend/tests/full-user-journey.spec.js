// Importa as funções 'test' e 'expect' do Playwright
import { test, expect } from '@playwright/test';

// A URL onde seu front-end está rodando
const FRONTEND_URL = 'http://localhost:5173';

// test.describe agrupa testes relacionados. Damos um nome ao nosso cenário.
test.describe('Jornada Completa do Usuário (CRUD)', () => {

  // A função 'test' define um caso de teste individual.
  test('Deve permitir criar, ler, atualizar e deletar um usuário', async ({ page }) => {
    // A fixture 'page' é a nossa aba do navegador, controlada pelo Playwright.

    // --- SETUP DO TESTE ---
    // Gera dados únicos para cada execução do teste para evitar conflitos.
    const uniqueId = new Date().getTime();
    const userName = `Usuário Teste ${uniqueId}`;
    const userEmail = `teste.${uniqueId}@example.com`;
    const updatedUserName = `Usuário Atualizado ${uniqueId}`;

    // --- ETAPA 1: NAVEGAÇÃO E VERIFICAÇÃO INICIAL ---
    await test.step('Navegar para a página inicial e verificar o estado inicial', async () => {
      // 1. Acessa a URL do front-end
      await page.goto(FRONTEND_URL);
      
      // 2. Verifica se o título principal da página está visível
      await expect(page.getByRole('heading', { name: 'Gerenciador de Usuários' })).toBeVisible();
      
      // 3. Verifica se o formulário está em modo de "Novo Usuário"
      await expect(page.getByRole('heading', { name: 'Novo Usuário' })).toBeVisible();
    });

    // --- ETAPA 2: CREATE (Criação do Usuário) ---
    await test.step('Criar um novo usuário', async () => {
      // 1. Preenche os campos do formulário
      await page.getByPlaceholder('Nome').fill(userName);
      await page.getByPlaceholder('E-mail').fill(userEmail);
      await page.getByPlaceholder('Senha').fill('senha123');
      
      // 2. Clica no botão "Salvar"
      await page.getByRole('button', { name: 'Salvar' }).click();

      // 3. VERIFICAÇÃO: O novo usuário deve aparecer na tabela.
      // Usamos 'getByRole' para encontrar a linha (row) que contém o texto com o nome do nosso usuário.
      const userRow = page.getByRole('row').filter({ hasText: userName });
      
      await expect(userRow).toBeVisible();
      // Verificamos também se o e-mail aparece na mesma linha.
      await expect(userRow.getByRole('cell', { name: userEmail })).toBeVisible();
    });

    // --- ETAPA 3: UPDATE (Atualização do Usuário) ---
    await test.step('Atualizar o usuário recém-criado', async () => {
      // Reutilizamos o localizador 'userRow' da etapa anterior.
      const userRow = page.getByRole('row').filter({ hasText: userName });

      // 1. Clica no botão "Editar" dentro da linha daquele usuário
      await userRow.getByRole('button', { name: 'Editar' }).click();

      // 2. VERIFICAÇÃO: O formulário deve mudar para o modo de edição
      await expect(page.getByRole('heading', { name: 'Editar Usuário' })).toBeVisible();
      // O campo nome deve conter o nome atual do usuário.
      await expect(page.getByPlaceholder('Nome')).toHaveValue(userName);
      // O campo de senha não deve estar visível.
      await expect(page.getByPlaceholder('Senha')).not.toBeVisible();

      // 3. Altera o nome no formulário
      await page.getByPlaceholder('Nome').fill(updatedUserName);

      // 4. Clica no botão "Atualizar"
      await page.getByRole('button', { name: 'Atualizar' }).click();
      
      // 5. VERIFICAÇÃO: A linha na tabela deve agora mostrar o nome atualizado.
      await expect(page.getByRole('cell', { name: updatedUserName })).toBeVisible();
      // O nome antigo não deve mais estar na tela.
      await expect(page.getByRole('cell', { name: userName })).not.toBeVisible();
    });

    // --- ETAPA 4: DELETE (Exclusão do Usuário) ---
    await test.step('Deletar o usuário atualizado', async () => {
      // Localizamos a linha do usuário com o nome já atualizado.
      const updatedUserRow = page.getByRole('row').filter({ hasText: updatedUserName });

      // O Playwright precisa ser instruído a lidar com caixas de diálogo do navegador (como o 'confirm').
      // Este listener de evento aceitará automaticamente qualquer diálogo que aparecer.
      page.on('dialog', dialog => dialog.accept());

      // 1. Clica no botão "Deletar"
      await updatedUserRow.getByRole('button', { name: 'Deletar' }).click();

      // 2. VERIFICAÇÃO: A linha do usuário deve desaparecer da tabela.
      await expect(page.getByRole('row').filter({ hasText: updatedUserName })).not.toBeVisible();
    });
  });
});
