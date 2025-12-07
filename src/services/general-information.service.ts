//Responsável de User: Bruno Macedo

export const GeneralInformationService = {
    async get(): Promise<[]> {
        //Colocar o objeto de Informações no lugar do []
        const response = await fetch("/api/general-information", {
            credentials: "include",
        });
        if (!response.ok) throw new Error("Erro ao buscar informações gerais");
        return response.json();
    },
};
