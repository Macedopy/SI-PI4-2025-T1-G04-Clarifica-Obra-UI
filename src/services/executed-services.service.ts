
//Responsável de User: Bruno Macedo
export const ExecutedServices = {
  //Coloque o Array do objeto de serviços aqui
  async getAll(): Promise<[]> {
    // Exemplo de fetch, ajuste a URL conforme sua API
    const response = await fetch("/api/executed-services", {
      credentials: "include",
    });
    if (!response.ok) throw new Error("Erro ao buscar serviços executados");
    return response.json();
  },
};
