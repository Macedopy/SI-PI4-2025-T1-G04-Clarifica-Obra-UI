//Responsável de User: Bruno Macedo

export const TeamPresentService = {
    //Coloque o Array do objeto da equipe aqui
    async getAll(): Promise<[]> {
        // Exemplo de fetch, ajuste a URL conforme sua API
        const response = await fetch("/api/team-present", {
            credentials: "include",
        });
        if (!response.ok) throw new Error("Erro ao buscar equipe presente");
        return response.json();
    },
};
