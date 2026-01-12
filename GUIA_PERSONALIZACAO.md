# 🎨 Guia de Personalização

## Como Personalizar o Sistema

### 🎨 Mudar Cores

#### Editar `styles.css` - Linha ~14
```css
:root {
    --primary-color: #667eea;      /* Cor principal (azul-roxo) */
    --secondary-color: #764ba2;    /* Cor secundária (roxo) */
    --success-color: #28a745;      /* Verde (sucesso) */
    --danger-color: #dc3545;       /* Vermelho (erro/perigo) */
    --warning-color: #ffc107;      /* Amarelo (aviso) */
    --info-color: #17a2b8;         /* Azul (informação) */
}
```

**Exemplos de mudança:**
- **Tema Azul**: `--primary-color: #0066cc; --secondary-color: #004499;`
- **Tema Verde**: `--primary-color: #28a745; --secondary-color: #1e7e34;`
- **Tema Rosa**: `--primary-color: #e91e63; --secondary-color: #c2185b;`

### 🏢 Mudar Nome da Empresa

#### No `index.html` - Linha ~11
```html
<div class="sidebar-header">
    <h3><i class="fas fa-building"></i> Tech Tower</h3>
    <!-- Mude "Tech Tower" para o nome desejado -->
</div>
```

#### No Dashboard - Linha ~63
```html
<h2 class="company-name">TECH TOWER COWORKING</h2>
<p class="company-legal-name">(JM2 SERVIÇOS ADMINISTRATIVOS LTDA – ME)</p>
```

### 📏 Mudar Largura da Sidebar

#### No `styles.css` - Linha ~17
```css
:root {
    --sidebar-width: 260px;        /* Largura expandida */
    --sidebar-collapsed: 70px;     /* Largura colapsada */
}
```

### 🎯 Adicionar Novo Item no Menu

#### 1. Adicionar no HTML (`index.html`)
```html
<!-- Após a linha ~40, adicionar: -->
<li class="menu-item" data-page="nomedaloja">
    <i class="fas fa-star"></i>
    <span>Nova Página</span>
</li>
```

#### 2. Criar a Página
```html
<!-- Após a linha ~620, adicionar: -->
<div class="page-content" id="nomeDaPaginaPage">
    <div class="page-header">
        <h2><i class="fas fa-star"></i> Título da Nova Página</h2>
    </div>
    
    <div class="content-card">
        <h3>Conteúdo aqui</h3>
        <p>Seu conteúdo personalizado...</p>
    </div>
</div>
```

#### 3. Adicionar no Script (`script.js`)
```javascript
// Na função navigateToPage, após linha ~842, adicionar:
const titles = {
    dashboard: 'Dashboard',
    contracts: 'Novo Contrato',
    signatures: 'Assinaturas',
    payments: 'Pagamentos',
    history: 'Histórico',
    settings: 'Configurações',
    nomeDaPagina: 'Nova Página'  // ← ADICIONE AQUI
};
```

### 🔢 Mudar Formato do Número do Contrato

#### No `script.js` - Função `generateNextContractNumber`
```javascript
// Formato atual: CEF 183-2025
// Alterar para outro formato:

generateNextContractNumber() {
    const year = new Date().getFullYear();
    const lastNumber = this.getLastContractNumber();
    const nextNumber = lastNumber + 1;
    
    // Exemplos de formatos diferentes:
    // return `${nextNumber}/${year}`;           // 183/2025
    // return `CON-${nextNumber}-${year}`;       // CON-183-2025
    // return `${year}-${String(nextNumber).padStart(4, '0')}`; // 2025-0183
    
    return `CEF ${nextNumber}-${year}`;  // Formato atual
}
```

### 📊 Adicionar Nova Métrica no Dashboard

#### 1. Adicionar Card no HTML
```html
<!-- Após a linha ~110, adicionar: -->
<div class="dashboard-card">
    <div class="card-icon" style="background: linear-gradient(135deg, #ff6b6b, #ee5a6f);">
        <i class="fas fa-users"></i>
    </div>
    <div class="card-content">
        <h3 id="totalClientsCount">0</h3>
        <p>Total de Clientes</p>
    </div>
</div>
```

#### 2. Atualizar no Script
```javascript
// Na função updateDashboard, adicionar:
function updateDashboard() {
    const contracts = ContractDatabase.getAllContracts();
    const contractsList = Object.values(contracts);
    
    // Sua nova métrica:
    const totalClients = contractsList.length;
    document.getElementById('totalClientsCount').textContent = totalClients;
    
    // ... resto do código
}
```

### 🎨 Mudar Ícones do Menu

Visite: [Font Awesome Icons](https://fontawesome.com/icons)

#### Exemplos:
```html
<i class="fas fa-tachometer-alt"></i>  <!-- Dashboard -->
<i class="fas fa-file-contract"></i>   <!-- Contratos -->
<i class="fas fa-signature"></i>        <!-- Assinaturas -->
<i class="fas fa-money-bill-wave"></i>  <!-- Pagamentos -->
<i class="fas fa-history"></i>          <!-- Histórico -->
<i class="fas fa-cog"></i>              <!-- Configurações -->

<!-- Outros ícones úteis: -->
<i class="fas fa-chart-bar"></i>        <!-- Gráficos -->
<i class="fas fa-users"></i>            <!-- Usuários -->
<i class="fas fa-calendar"></i>         <!-- Calendário -->
<i class="fas fa-envelope"></i>         <!-- Email -->
<i class="fas fa-bell"></i>             <!-- Notificações -->
```

### 📱 Ajustar Breakpoints Responsivos

#### No `styles.css` - Seção de Media Queries
```css
/* Desktop grande - Linha ~1588 */
@media (max-width: 1024px) {
    /* Ajustes para tablets */
}

/* Mobile - Linha ~1595 */
@media (max-width: 768px) {
    /* Ajustes para celular */
}

/* Mobile pequeno - Linha ~1645 */
@media (max-width: 480px) {
    /* Ajustes para celulares pequenos */
}
```

### 🔤 Adicionar Fontes Customizadas

#### No `<head>` do HTML
```html
<!-- Adicionar após linha 8: -->
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
```

#### No CSS
```css
body {
    font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
```

### 🌙 Criar Modo Escuro

#### Adicionar no `styles.css`
```css
/* Modo Escuro - Adicionar no início */
body.dark-mode {
    --white: #1a1a1a;
    --light-gray: #2d2d2d;
    --medium-gray: #404040;
    --dark-gray: #e0e0e0;
    background: #0f0f0f;
}

body.dark-mode .sidebar {
    background: linear-gradient(135deg, #2d3561 0%, #3a2d54 100%);
}
```

#### Adicionar Botão no HTML
```html
<!-- Na top-bar, adicionar: -->
<button onclick="toggleDarkMode()" class="btn btn-sm">
    <i class="fas fa-moon"></i>
</button>
```

#### Adicionar Função no Script
```javascript
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
}

// Carregar preferência ao iniciar
document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
    }
});
```

### 📈 Adicionar Gráficos

#### Usar Chart.js
```html
<!-- No <head>, adicionar: -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
```

```html
<!-- No dashboard, adicionar: -->
<div class="content-card">
    <h3>Gráfico de Contratos</h3>
    <canvas id="contractsChart"></canvas>
</div>
```

```javascript
// No script.js
function createChart() {
    const ctx = document.getElementById('contractsChart');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'],
            datasets: [{
                label: 'Contratos',
                data: [12, 19, 3, 5, 2, 3],
                borderColor: '#667eea',
                tension: 0.1
            }]
        }
    });
}
```

### 🔔 Adicionar Notificações

#### HTML
```html
<!-- Adicionar antes do </body> -->
<div id="notifications" class="notifications-container"></div>
```

#### CSS
```css
.notifications-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 10000;
}

.notification {
    background: white;
    padding: 15px 20px;
    margin-bottom: 10px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
}

@keyframes slideIn {
    from { transform: translateX(400px); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}
```

#### JavaScript
```javascript
function showNotification(message, type = 'info') {
    const container = document.getElementById('notifications');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-info-circle"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Uso:
showNotification('Contrato salvo com sucesso!', 'success');
```

## 🎯 Dicas Finais

1. **Sempre faça backup** antes de mudar código
2. **Teste em mobile** após cada mudança
3. **Use DevTools** (F12) para debugar
4. **Comente seu código** para lembrar depois
5. **Mantenha consistência** visual

## 📚 Recursos Úteis

- **Cores**: [Coolors.co](https://coolors.co/)
- **Ícones**: [Font Awesome](https://fontawesome.com/)
- **Gradientes**: [CSS Gradient](https://cssgradient.io/)
- **Fontes**: [Google Fonts](https://fonts.google.com/)
- **Inspiração**: [Dribbble](https://dribbble.com/)

---

💡 **Dúvidas?** Consulte o código comentado ou entre em contato!
