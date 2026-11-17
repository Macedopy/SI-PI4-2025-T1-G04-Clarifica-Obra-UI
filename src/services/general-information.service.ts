// Responsável: Bruno Macedo

export interface GeneralInformationData {
  id?: string;
  constructionId?: string;
  address: string;
  landArea: number;
  topography: 'plana' | 'inclinada' | 'acidentada' | 'com desnível';
  startDate: string;
  technicalManager?: string;
  observations?: string;
}

const API_BASE = 'http://localhost:8080';

export const GeneralInformationService = {
  async get(constructionId: string): Promise<GeneralInformationData> {
    const response = await fetch(`${API_BASE}/general-information/${constructionId}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Erro ao buscar informações gerais');
    return response.json();
  },

  async save(
    constructionId: string,
    data: GeneralInformationData
  ): Promise<GeneralInformationData> {
    const response = await fetch(`${API_BASE}/general-information/${constructionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Erro ao salvar informações gerais');
    return response.json();
  },
};
