//Responsável de User: Bruno Macedo

export interface MaterialItem {
    id: string;
    nome: string;
    categoria: string;
    quantidadeConsumida: number;
    unidade: string;
    estoqueAtual: number;
    estoqueMinimo: number;
    reposicao: boolean;
    urgencia: string;
}

export class UsedMaterialsService {
    static async getAll(): Promise<MaterialItem[]> {
        // Substitua por chamada real à API
        return [
            {
                id: '1',
                nome: 'Cimento CP-II 50kg',
                categoria: 'cimento',
                quantidadeConsumida: 20,
                unidade: 'saco',
                estoqueAtual: 50,
                estoqueMinimo: 30,
                reposicao: false,
                urgencia: 'normal'
            },
            {
                id: '2',
                nome: 'Areia Média',
                categoria: 'areia',
                quantidadeConsumida: 5,
                unidade: 'm3',
                estoqueAtual: 10,
                estoqueMinimo: 3,
                reposicao: true,
                urgencia: 'urgente'
            }
        ];
    }
}
