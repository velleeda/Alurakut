import { SiteClient } from "datocms-client";

export default async function recebedorDeRequests(request, response) {
  if (request.method === "POST") {
    const TOKEN = "6f2355ad8b692fcc9cdbc7d05f4e07";

    const client = new SiteClient(TOKEN);

    const registroCriado = await client.items.create({
      itemType: "975388",
      ...request.body,
/*       title: "Comunidade Teste",
      imageUrl: "https://github.com/velleeda.png",
      creatorSlug: "velleeda", */
    })

    response.json({
        dados: 'Algum dado qualquer',
        registroCriado: registroCriado,
    })
    return;
  }

  response.status(404).json({
    message: "Ainda não temos nada no GET, mas no POST tem!",
  });
}
