window.onload = function() {
  let usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

  // Remove qualquer Admin antigo com CPF igual
  usuarios = usuarios.filter(u => u.cpf !== "12345678910");

  // Recria o Admin com a senha fixa
  usuarios.push({
    cpf: "12345678910",
    senha: "123",
    isAdmin: true
  });

  localStorage.setItem("usuarios", JSON.stringify(usuarios));
};
let modo = ""; // 'login' ou 'cadastro'
let cpfTemp = "";

function iniciarLogin() {
  modo = "login";
  document.getElementById("step-choose").classList.add("hidden");
  document.getElementById("step-cpf").classList.remove("hidden");
}

function iniciarCadastro() {
  modo = "cadastro";
  document.getElementById("step-choose").classList.add("hidden");
  document.getElementById("step-cpf").classList.remove("hidden");
}

function verificarCPF() {
  cpfTemp = document.getElementById("cpf").value.trim();
  if (!cpfTemp) {
    alert("Por favor, digite um CPF válido.");
    return;
  }

  const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  const usuarioExiste = usuarios.find(u => u.cpf === cpfTemp);

  if (modo === "login") {
    if (usuarioExiste) {
      document.getElementById("step-cpf").classList.add("hidden");
      document.getElementById("step-senha").classList.remove("hidden");
    } else {
      alert("CPF não encontrado. Registre-se primeiro.");
      location.reload();
    }
  } else {
    if (usuarioExiste) {
      alert("CPF já registrado. Tente fazer login.");
      location.reload();
    } else {
      document.getElementById("step-cpf").classList.add("hidden");
      document.getElementById("step-cadastro").classList.remove("hidden");
    }
  }
}

function verificarSenha() {
  const senha = document.getElementById("senha").value.trim();
  const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");
  const usuario = usuarios.find(u => u.cpf === cpfTemp && u.senha === senha);

  if (usuario) {
    localStorage.setItem("usuarioLogado", cpfTemp);
    localStorage.setItem("isAdmin", usuario.isAdmin ? "true" : "false");
    window.location.href = "index.html";
  } else {
    alert("Senha incorreta.");
  }
}

function finalizarCadastro() {
  const senha = document.getElementById("novaSenha").value.trim();
  if (!senha) {
    alert("Digite uma senha válida.");
    return;
  }

  // Captura o array atual de usuários salvos
  const usuarios = JSON.parse(localStorage.getItem("usuarios") || "[]");

  // Cria um novo objeto usuário
    usuarios.push({
    cpf: cpfTemp,
    senha: cpfTemp === "12345678910" ? "senha" : senha,  // Senha fixa para admin
    isAdmin: cpfTemp === "12345678910"
    });

  // Salva de volta no LocalStorage
  localStorage.setItem("usuarios", JSON.stringify(usuarios));

  alert("Cadastro realizado com sucesso!");
  window.location.href = "index.html";
}