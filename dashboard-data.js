/**
 * Dashboard Data Manager
 * Gerencia dados e métricas do dashboard
 */

const DashboardData = {
    /**
     * Inicializa dados de exemplo para demonstração
     */
    initializeSampleData() {
        // Verifica se já existem dados
        const contracts = ContractDatabase.getAllContracts();
        
        if (Object.keys(contracts).length === 0) {
            console.log('Inicializando dados de exemplo...');
            
            // Criar alguns contratos de exemplo
            const sampleContracts = [
                {
                    contractNumber: 'CEF 180-2025',
                    companyName: 'Tech Solutions LTDA',
                    companyDocument: '12.345.678/0001-90',
                    monthlyContractValue: 'R$ 890,00',
                    signed: true,
                    savedAt: new Date(Date.now() - 86400000 * 5).toISOString() // 5 dias atrás
                },
                {
                    contractNumber: 'CEF 181-2025',
                    companyName: 'Inovação Digital ME',
                    companyDocument: '23.456.789/0001-01',
                    monthlyContractValue: 'R$ 1.200,00',
                    signed: false,
                    savedAt: new Date(Date.now() - 86400000 * 3).toISOString() // 3 dias atrás
                },
                {
                    contractNumber: 'CEF 182-2025',
                    companyName: 'Consultoria Smart',
                    companyDocument: '34.567.890/0001-12',
                    monthlyContractValue: 'R$ 650,00',
                    signed: true,
                    savedAt: new Date(Date.now() - 86400000).toISOString() // 1 dia atrás
                },
                {
                    contractNumber: 'CEF 183-2025',
                    companyName: 'Startup Plus',
                    companyDocument: '45.678.901/0001-23',
                    monthlyContractValue: 'R$ 450,00',
                    signed: false,
                    savedAt: new Date().toISOString() // Hoje
                }
            ];
            
            // Salvar contratos de exemplo
            sampleContracts.forEach(contract => {
                ContractDatabase.saveContract(contract);
            });
            
            console.log('Dados de exemplo inicializados com sucesso!');
        }
    },
    
    /**
     * Limpa dados de exemplo
     */
    clearSampleData() {
        if (confirm('Tem certeza que deseja limpar todos os dados de exemplo?')) {
            localStorage.removeItem('contractsDatabase');
            localStorage.removeItem('lastContractNumber');
            console.log('Dados de exemplo removidos');
            location.reload();
        }
    },
    
    /**
     * Exporta dados para JSON
     */
    exportToJSON() {
        const contracts = ContractDatabase.getAllContracts();
        const dataStr = JSON.stringify(contracts, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `contratos_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    },
    
    /**
     * Calcula estatísticas gerais
     */
    getStatistics() {
        const contracts = Object.values(ContractDatabase.getAllContracts());
        
        return {
            total: contracts.length,
            signed: contracts.filter(c => c.signed).length,
            pending: contracts.filter(c => !c.signed).length,
            thisMonth: contracts.filter(c => {
                const date = new Date(c.savedAt);
                const now = new Date();
                return date.getMonth() === now.getMonth() && 
                       date.getFullYear() === now.getFullYear();
            }).length
        };
    }
};

// Inicializar dados de exemplo quando o documento carregar
// (Comentado por padrão - descomente para ativar)
// document.addEventListener('DOMContentLoaded', () => {
//     DashboardData.initializeSampleData();
// });
