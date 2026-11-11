const obj = document.getElementById("objeto");
const seletor = document.getElementById("seletor");
const local = document.getElementById("local");
const guardar = document.getElementById("guardar");
const listar = document.getElementById("listar");
const buscar = document.getElementById("buscar");
const selbuscar = document.getElementById("selbuscar");
const formulario = document.getElementById("formulario");
const aviso = document.getElementById("aviso");
const tlpaviso = document.getElementById("tela-login-aviso");
const btnsair = document.getElementById("tela-app-sair");
const formulariologin = document.getElementById("formulario-login");
const senha = document.getElementById("senha");
const telaLogin = document.getElementById("tela-login");
const telaApp = document.getElementById("tela-app");
const telaComodos = document.getElementById("painel-comodos");
const formComodo = document.getElementById("form-comodo");
const btnComodos = document.getElementById("btn-comodos");
const listaComodos = document.getElementById("lista-comodos");
const novoComodo = document.getElementById("novo-comodo");
const btnEnviar = document.getElementById("btn-enviar");
const email = document.getElementById("email");
const btnModo = document.getElementById("btn-modo");
const subtituloLogin = document.getElementById("subtitulo-login");
const textoModo = document.getElementById("texto-modo");
const btnOlho = document.getElementById("btn-olho");

function mostrarTela(tela) {
  telaLogin.style.display = "none";
  telaApp.style.display = "none";
  tela.style.display = "block";
}

let token = localStorage.getItem("token");
let modoCadastro = false;
let itens = [];

function api(url, opcoes = {}) {
  opcoes.headers = {
    ...opcoes.headers,
    Authorization: `Bearer ${token}`,
  };
  return fetch(url, opcoes);
}

async function carregar() {
  try {
    const resposta = await api("/itens");
    if (resposta.status === 401) {
      localStorage.removeItem("token");
      token = null;
      mostrarTela(telaLogin);
      return mostrarAvisoLogin("Sessão expirada. Faça login de novo.");
    }
    if (!resposta.ok) {
      return mostrarAviso("Erro ao carregar os itens");
    }
    itens = await resposta.json();
    mostrarAvisoLogin("");
    mostrarAviso("");
    renderizar();
    mostrarTela(telaApp);
  } catch (erro) {
    mostrarAviso("Não foi possível conectar ao servidor");
    mostrarAvisoLogin("Não foi possível conectar ao servidor");
  }
}

let editando = null;

function mostrarAviso(texto) {
  aviso.textContent = texto;
}

function mostrarAvisoLogin(texto) {
  tlpaviso.textContent = texto;
}

function esconderSenha() {
  senha.type = "password";
  btnOlho.textContent = "👁️";
  btnOlho.setAttribute("aria-label", "Mostrar senha");
}

let comodos = [];

async function carregarComodos() {
  try {
    const resposta = await api("/comodos");
    if (!resposta.ok) {
      return;
    }
    comodos = await resposta.json();

    const filtroAtual = selbuscar.value;
    const seletorAtual = seletor.value;

    seletor.innerHTML = '<option value="">Escolha o cômodo</option>';
    selbuscar.innerHTML = '<option value="">Todos os cômodos</option>';
    listaComodos.innerHTML = "";

    comodos.forEach(function (comodo) {
      const opcao1 = document.createElement("option");
      opcao1.value = comodo.id;
      opcao1.textContent = comodo.nome;
      seletor.appendChild(opcao1);

      const opcao2 = document.createElement("option");
      opcao2.value = comodo.id;
      opcao2.textContent = comodo.nome;
      selbuscar.appendChild(opcao2);

      const liComodo = document.createElement("li");
      const btnComodo = document.createElement("button");
      liComodo.textContent = comodo.nome;
      btnComodo.textContent = "X";
      liComodo.appendChild(btnComodo);
      listaComodos.appendChild(liComodo);

      btnComodo.addEventListener("click", async function () {
        try {
          const resposta = await api(`/comodos/${comodo.id}`, {
            method: "DELETE",
          });
          if (!resposta.ok) {
            const dados = await resposta.json();
            return mostrarAviso(dados.erro);
          }

          mostrarAviso("");
          carregarComodos();
        } catch (erro) {
          mostrarAviso("Não foi possível conectar ao servidor");
        }
      });
    });

    selbuscar.value = filtroAtual;
    seletor.value = seletorAtual;
    renderizar();
  } catch (erro) {
    return;
  }
}

function limparGuardar() {
  editando = null;
  obj.value = "";
  local.value = "";
  seletor.value = "";
  guardar.textContent = "Guardar";
}

function renderizar() {
  const termo = buscar.value.trim().toLowerCase();
  const filtro = selbuscar.value;

  const visiveis = itens.filter(function (item) {
    return (
      item.nome.toLowerCase().includes(termo) &&
      (filtro === "" || item.comodo_id === Number(filtro))
    );
  });

  listar.innerHTML = "";
  visiveis.forEach(function (item) {
    const del = document.createElement("button");
    const li = document.createElement("li");
    const edit = document.createElement("button");
    const nome = document.createElement("strong");
    nome.textContent = item.nome;
    nome.classList.add("nome");

    const etiqueta = document.createElement("span");
    etiqueta.textContent = item.comodo;
    etiqueta.classList.add("etiqueta");

    const lugar = document.createElement("span");
    lugar.textContent = item.local;
    lugar.classList.add("lugar");

    const info = document.createElement("div");
    info.classList.add("info");

    edit.textContent = "Editar";
    del.textContent = "X";
    info.appendChild(nome);
    info.appendChild(etiqueta);
    info.appendChild(lugar);
    li.appendChild(info);
    li.appendChild(edit);
    li.appendChild(del);
    listar.appendChild(li);

    edit.classList.add("btn-editar");
    del.classList.add("btn-delete");

    del.addEventListener("click", async function () {
      try {
        const resposta = await api(`/itens/${item.id}`, { method: "DELETE" });
        if (!resposta.ok) {
          return mostrarAviso("Não foi possível apagar o item");
        }
        if (editando && editando.id === item.id) {
          limparGuardar();
        }
        carregar();
      } catch (erro) {
        mostrarAviso("Não foi possível conectar ao servidor");
      }
    });

    edit.addEventListener("click", function () {
      obj.value = item.nome;
      seletor.value = item.comodo_id;
      local.value = item.local;

      editando = item;
      guardar.textContent = "Salvar alteração";
    });
  });
}

buscar.addEventListener("input", function () {
  renderizar();
});

selbuscar.addEventListener("change", function () {
  renderizar();
});

async function guardarCampo() {
  const nome = obj.value.trim();
  const comodo = seletor.value;
  const loc = local.value.trim();

  if (nome === "" || comodo === "" || loc === "") {
    return mostrarAviso("Preencha todos os campos");
  }

  try {
    let resposta;

    if (editando) {
      resposta = await api(`/itens/${editando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome,
          comodo_id: Number(comodo),
          local: loc,
        }),
      });
    } else {
      resposta = await api("/itens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nome: nome,
          comodo_id: Number(comodo),
          local: loc,
        }),
      });
    }

    if (!resposta.ok) {
      return mostrarAviso("Não foi possível salvar o item");
    }

    limparGuardar();
    carregar();
  } catch (erro) {
    mostrarAviso("Não foi possível conectar ao servidor");
  }
}

formulario.addEventListener("submit", function (event) {
  event.preventDefault();
  guardarCampo();
});

formulariologin.addEventListener("submit", async function (event) {
  event.preventDefault();

  const emailDigitado = email.value.trim();
  const senhaDigitado = senha.value;

  try {
    if (modoCadastro) {
      const respCadastro = await fetch("/auth/cadastro", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailDigitado, senha: senhaDigitado }),
      });

      if (!respCadastro.ok) {
        const dados = await respCadastro.json().catch(function () {
          return {};
        });
        return mostrarAvisoLogin(
          dados.erro || "Erro no servidor. Tente novamente.",
        );
      }
    }

    const respLogin = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: emailDigitado, senha: senhaDigitado }),
    });

    if (!respLogin.ok) {
      const dados = await respLogin.json().catch(function () {
        return {};
      });
      return mostrarAvisoLogin(
        dados.erro || "Erro no servidor. Tente novamente.",
      );
    }

    const dados = await respLogin.json();
    token = dados.token;
    localStorage.setItem("token", token);

    email.value = "";
    senha.value = "";
    esconderSenha();
    iniciar();
  } catch (erro) {
    mostrarAvisoLogin("Não foi possível conectar ao servidor");
  }
});

btnsair.addEventListener("click", function () {
  telaComodos.classList.add("escondido");
  btnComodos.classList.remove("ativo");
  token = null;
  limparGuardar();
  novoComodo.value = "";
  selbuscar.value = "";
  buscar.value = "";
  esconderSenha();
  mostrarAviso("");
  localStorage.removeItem("token");
  mostrarTela(telaLogin);
});

btnComodos.addEventListener("click", function () {
  telaComodos.classList.toggle("escondido");
  btnComodos.classList.toggle("ativo");
});

formComodo.addEventListener("submit", async function (event) {
  event.preventDefault();

  const nome = novoComodo.value.trim();
  if (nome === "") {
    return mostrarAviso("Digite o nome do cômodo");
  }

  try {
    const resposta = await api("/comodos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome: nome }),
    });

    if (!resposta.ok) {
      const dados = await resposta.json();
      return mostrarAviso(dados.erro);
    }

    novoComodo.value = "";
    mostrarAviso("");
    carregarComodos();
  } catch (erro) {
    mostrarAviso("Não foi possível conectar ao servidor");
  }
});

btnModo.addEventListener("click", function () {
  modoCadastro = !modoCadastro;
  mostrarAvisoLogin("");

  if (modoCadastro) {
    subtituloLogin.textContent = "Criar conta";
    btnEnviar.textContent = "Cadastrar";
    textoModo.textContent = "Já tem conta?";
    btnModo.textContent = "Entrar";
    senha.placeholder = "Senha (mínimo 8 caracteres)";
    senha.autocomplete = "new-password";
  } else {
    subtituloLogin.textContent = "Entrar";
    btnEnviar.textContent = "Entrar";
    textoModo.textContent = "Não tem conta?";
    btnModo.textContent = "Criar conta";
    senha.placeholder = "Senha";
    senha.autocomplete = "current-password";
  }
});

btnOlho.addEventListener("click", function () {
  if (senha.type === "password") {
    senha.type = "text";
    btnOlho.textContent = "🙈";
    btnOlho.setAttribute("aria-label", "Esconder senha");
  } else {
    esconderSenha();
  }
});

async function iniciar() {
  await carregarComodos();
  carregar();
}

if (token) {
  iniciar();
} else {
  mostrarTela(telaLogin);
}
