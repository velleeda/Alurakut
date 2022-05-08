import React, { useEffect, useState } from "react";
import nookies from "nookies";
import jwt from "jsonwebtoken";

import MainGrid from "../components/MainGrid";
import Box from "../components/Box";
import { ProfileRelationsBoxWrapper } from "../components/ProfileRelations";

import {
  AlurakutMenu,
  AlurakutProfileSidebarMenuDefault,
  OrkutNostalgicIconSet,
} from "../lib/AlurakutCommons";

function ProfileSidebar(props) {
  return (
    <Box>
      <img
        src={`https://github.com/${props.githubUser}.png`}
        style={{ borderRadius: "8px" }}
      />

      <hr />

      <p>
        <a className="boxLink" href={`https://github.com/${props.githubUser}`}>
          @{props.githubUser}
        </a>
      </p>

      <hr />

      <AlurakutProfileSidebarMenuDefault />
    </Box>
  );
}

export default function Home(props) {
  const [comunidades, setComunidades] = useState([]);
  const [seguidores, setSeguidores] = useState([]);

  const githubUser = props.githubUser;

  const pessoasFavoritas = [
    "NiveKian",
    "Setsped",
    "SadAutist",
    "juunegreiros",
    "omariosouto",
    "peas",
  ];

  const seisComunidades = comunidades.slice(0, 6);
  const seisSeguidores = seguidores.slice(0, 6);
  const seisPessoasFavoritas = pessoasFavoritas.slice(0, 6);

  useEffect(() => {
    fetch("https://api.github.com/users/velleeda/followers")
      .then(function (respostaDoServidor) {
        return respostaDoServidor.json();
      })
      .then(function (respostaCompleta) {
        setSeguidores(respostaCompleta);
      });

    fetch("https://graphql.datocms.com/", {
      method: "POST",
      headers: {
        Authorization: "5d805a2279f0401f6cdb103405f0a1",
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: `query {
          allCommunities {
            title
            id
            imageUrl
            creatorSlug
          }
        }`,
      }),
    })
      .then((respostaDoServidor) => {
        return respostaDoServidor.json();
      })
      .then((respostaCompleta) => {
        const comunidadesDoDato = respostaCompleta.data.allCommunities;
        setComunidades(comunidadesDoDato);
      });
  }, []);

  const handleCreateCommunity = (event) => {
    event.preventDefault();

    const dadosDoForm = new FormData(event.target);

    const comunidade = {
      title: dadosDoForm.get("title"),
      imageUrl: dadosDoForm.get("image"),
      creatorSlug: githubUser,
    };

    fetch("/api/comunidades", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(comunidade),
    }).then(async (response) => {
      const dados = await response.json();

      const comunidade = dados.registroCriado;

      const comunidadesAtualizadas = [...comunidades, comunidade];

      setComunidades(comunidadesAtualizadas);
    });
  };

  return (
    <>
      <AlurakutMenu />
      <MainGrid>
        <div className="profileArea" style={{ gridArea: "profileArea" }}>
          <ProfileSidebar githubUser={githubUser} />
        </div>
        <div className="welcomeArea" style={{ gridArea: "welcomeArea" }}>
          <Box>
            <h1 className="title">Bem-vindo(a)</h1>

            <OrkutNostalgicIconSet />
          </Box>

          <Box>
            <h2 className="subTitle">O que você deseja fazer?</h2>
            <form onSubmit={(event) => handleCreateCommunity(event)}>
              <div>
                <input
                  placeholder="Qual vai ser o nome da sua comunidade?"
                  name="title"
                  aria-label="Qual vai ser o nome da sua comunidade?"
                  type="text"
                />
              </div>
              <div>
                <input
                  placeholder="Coloque uma URL para usarmos de capa"
                  name="image"
                  aria-label="Coloque uma URL para usarmos de capa"
                />
              </div>
              <button>Criar comunidade</button>
            </form>
          </Box>
        </div>
        <div
          className="profileRelationsArea"
          style={{ gridArea: "profileRelationsArea" }}
        >
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">Seguidores ({seguidores.length})</h2>
            <ul>
              {seisSeguidores.map((i) => {
                return (
                  <li key={i.id}>
                    <a href={`https://github.com/${i.login}`}>
                      <img src={`https://github.com/${i.login}.png`} />
                      <span>{i.login}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Pessoas da comunidade ({pessoasFavoritas.length})
            </h2>
            <ul>
              {seisPessoasFavoritas.map((i) => {
                return (
                  <li key={i}>
                    <a href={`/users/${i}`}>
                      <img src={`https://github.com/${i}.png`} />
                      <span>{i}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
          <ProfileRelationsBoxWrapper>
            <h2 className="smallTitle">
              Minhas comunidades ({comunidades.length})
            </h2>
            <ul>
              {seisComunidades.map((i) => {
                return (
                  <li key={i.id}>
                    <a href={`/communities/${i.id}`}>
                      <img src={i.imageUrl} />
                      <span>{i.title}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </ProfileRelationsBoxWrapper>
        </div>
      </MainGrid>
    </>
  );
}

export async function getServerSideProps(context) {
  const cookies = nookies.get(context);
  const token = cookies.USER_TOKEN;

  const { isAuthenticated } = await fetch(
    "https://alurakut-two-pi.vercel.app/api/auth",
    {
      headers: {
        Authorization: token,
      },
    }
  ).then((response) => response.json());

  if (!isAuthenticated) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const { githubUser } = jwt.decode(token);

  return {
    props: {
      githubUser,
    },
  };
}
