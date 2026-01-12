# Sistema de Gestão de Contratos - Tech Tower Coworking

## 📋 Sobre o Sistema

Sistema completo de gestão de contratos com interface moderna, sidebar navegável e dashboard com métricas em tempo real. Desenvolvido para gerenciar contratos de coworking com integração de assinaturas digitais (ZapSign) e pagamentos (Asaas).

## ✨ Características Principais

### 🎨 Interface Moderna
- **Sidebar Responsiva**: Menu lateral com ícones e navegação intuitiva
- **Layout Adaptável**: Funciona perfeitamente em desktop, tablet e mobile
- **Design Moderno**: Gradientes, sombras e animações suaves
- **Tema Consistente**: Cores e estilos profissionais

### 📊 Dashboard Interativo
- **Métricas em Tempo Real**:
  - Contratos Pendentes
  - Contratos Assinados
  - Pagamentos Pendentes
  - Receita do Mês
- **Atividades Recentes**: Histórico das últimas ações
- **Ações Rápidas**: Acesso direto às funcionalidades principais

### 📝 Gestão de Contratos
- **Formulário Completo**: Todos os campos necessários para criar contratos
- **Numeração Automática**: Gera números sequenciais automaticamente
- **Validação de Dados**: Máscaras e validações em tempo real
- **Armazenamento Local**: Salva contratos no navegador

### ✍️ Assinaturas Digitais
- **Integração ZapSign**: Envio de contratos para assinatura
- **Acompanhamento**: Visualize status das assinaturas
- **Configuração Simples**: Interface para configurar API

### 💰 Gestão de Pagamentos
- **Integração Asaas**: Gerenciamento completo de cobranças
- **Dashboard de Pagamentos**: Visualize pendentes, recebidos e vencidos
- **Métricas Financeiras**: Acompanhe receitas em tempo real

### 📜 Histórico Completo
- **Todos os Contratos**: Listagem completa com filtros
- **Status Visual**: Badges coloridas para identificar status
- **Exportação**: Exporte dados para análise

## 🚀 Como Usar

### 1. Abrir o Sistema
Abra o arquivo `index.html` em qualquer navegador moderno.

### 2. Navegação
Use o menu lateral para navegar entre as páginas:
- **Dashboard**: Visão geral e métricas
- **Novo Contrato**: Criar novos contratos
- **Assinaturas**: Gerenciar assinaturas digitais
- **Pagamentos**: Acompanhar cobranças
- **Histórico**: Ver todos os contratos
- **Configurações**: Configurar integrações

### 3. Criar um Contrato
1. Clique em "Novo Contrato" no menu
2. Preencha todos os campos obrigatórios (*)
3. Adicione/remova itens da tabela de benefícios
4. Aceite os termos e clique em "Prosseguir"

### 4. Configurar Integrações

#### ZapSign (Assinaturas)
1. Vá em Configurações ou clique em "Configurar ZapSign"
2. Insira seu Token de API do ZapSign
3. Configure o ID do Signatário padrão
4. Salve as configurações

#### Asaas (Pagamentos)
1. Vá em Configurações ou clique em "Configurar Asaas"
2. Insira sua API Key do Asaas
3. Configure se está usando Sandbox ou Produção
4. Salve as configurações

## 📱 Responsividade

O sistema se adapta automaticamente a diferentes tamanhos de tela:

### Desktop (> 1024px)
- Sidebar fixa e expandida
- Dashboard com 4 cards em linha
- Todas as funcionalidades visíveis

### Tablet (768px - 1024px)
- Sidebar colapsável
- Dashboard com 2 cards por linha
- Layout otimizado

### Mobile (< 768px)
- Sidebar oculta (abre com menu hambúrguer)
- Dashboard com 1 card por linha
- Interface touch-friendly
- Formulários em coluna única

## 🎨 Paleta de Cores

```css
--primary-color: #667eea (Azul-roxo)
--secondary-color: #764ba2 (Roxo)
--success-color: #28a745 (Verde)
--danger-color: #dc3545 (Vermelho)
--warning-color: #ffc107 (Amarelo)
--info-color: #17a2b8 (Azul)
```

## 📂 Estrutura de Arquivos

```
Contrato/
├── index.html                 # Arquivo principal com todas as páginas
├── styles.css                 # Estilos completos do sistema
├── script.js                  # Lógica principal e dashboard
├── dashboard-data.js          # Gerenciamento de dados do dashboard
├── zapsign-integration.js     # Integração com ZapSign
├── asaas-integration.js       # Integração com Asaas
├── review.html                # Página de revisão de contrato
├── jsPDF.min.js              # Biblioteca para gerar PDFs
└── README.md                  # Este arquivo
```

## 🔧 Funcionalidades Técnicas

### Armazenamento Local
- Usa `localStorage` para salvar contratos
- Persiste configurações de API
- Mantém histórico de numeração

### Validações
- Máscaras automáticas (CPF, CNPJ, Telefone)
- Validação em tempo real
- Mensagens de erro claras

### Navegação SPA
- Single Page Application
- Transições suaves entre páginas
- Sem recarregamento de página

### API Integrations
- **ZapSign**: Assinaturas digitais
- **Asaas**: Gestão de pagamentos
- Chamadas assíncronas (fetch API)

## 🌐 Navegadores Suportados

- ✅ Chrome/Edge (Chromium) 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

## 📝 Dados de Exemplo

Para testar o sistema com dados de exemplo, descomente a linha no arquivo `dashboard-data.js`:

```javascript
document.addEventListener('DOMContentLoaded', () => {
    DashboardData.initializeSampleData();
});
```

Isso criará 4 contratos de exemplo ao carregar o sistema.

## 🔒 Segurança

- **Dados Locais**: Todos os dados ficam no navegador do usuário
- **API Keys**: Armazenadas localmente (não compartilhadas)
- **Validações**: Proteção contra entradas inválidas

## 🆘 Suporte

Para dúvidas ou problemas:
- Email: adm@techtowercoworking.com.br
- Telefone: (12) 98198-0288
- Site: www.techtowercoworking.com.br

## 📄 Licença

© 2025 Tech Tower Coworking - Todos os direitos reservados

---

**Versão**: 2.0  
**Última Atualização**: Janeiro 2025  
**Desenvolvido para**: JM2 Serviços Administrativos LTDA
