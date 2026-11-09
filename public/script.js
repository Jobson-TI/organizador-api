const obj = document.getElementById("objeto");
const seletor = document.getElementById("seletor");
const local = document.getElementById("local");
const guardar = document.getElementById("guardar");
const listar = document.getElementById("listar");
const buscar = document.getElementById("buscar");
const selbuscar = document.getElementById("selbuscar");
const formulario = document.getElementById("formulario");
const aviso = document.getElementById("aviso");

let itens = [];

async function carregar() {
  try {
    const resposta = await fetch("/itens");
    if(!resposta.ok){
      return mostrarAviso("Erro ao carregar os itens");  
    }
    itens = await resposta.json();
    mostrarAviso("")
    renderizar();  
  } catch (erro) {
    mostrarAviso("Não foi possível conectar ao servidor");
  } 
};

let editando = null;

function mostrarAviso(texto) {
    aviso.textContent = texto;
}

function limparGuardar(){
  editando = null;
  obj.value = "";
  local.value = "";
  seletor.value = "";
  guardar.textContent = "Guardar";
};

function renderizar() {
  const termo = buscar.value.trim().toLowerCase();
  const filtro = selbuscar.value;

  const visiveis = itens.filter(function (item) {
    return (
      item.nome.toLowerCase().includes(termo) &&
      (filtro === "" || item.comodo === filtro)
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
        const resposta = await fetch(`/itens/${item.id}`, { method: "DELETE" });
        if (!resposta.ok) {
          return mostrarAviso("Não foi possível salvar o item");
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
      seletor.value = item.comodo;
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

async function guardarCampo(){
  const nome = obj.value.trim();
  const comodo = seletor.value;
  const loc = local.value.trim();

  if (nome === "" || comodo === "" || loc === "") {
    return mostrarAviso("Preencha todos os campos");
  }

  try {
    let resposta;

    if (editando) {
      resposta = await fetch(`/itens/${editando.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome, comodo: comodo, local: loc })
      });
    } else {
      resposta = await fetch("/itens", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: nome, comodo: comodo, local: loc })
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

};

formulario.addEventListener("submit", function (event){
  event.preventDefault();
  guardarCampo();
});

carregar();
