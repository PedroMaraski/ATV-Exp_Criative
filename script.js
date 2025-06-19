if (!localStorage.getItem("usuarioLogado")) {
  window.location.href = baseURL + "login.html";
}

// script.js atualizado com botão ≡ e ajuste de logout
if (!localStorage.getItem("usuarioLogado")) {
  window.location.href = baseURL + "login.html";
}
if (localStorage.getItem("isAdmin") === "true") {
  // Liberar função administrativa
}
const boundsBrasil = [
  [-34.0, -74.0],
  [5.5, -32.0]
];

let map = L.map('map', {
  center: [-25.4294, -49.2719],
  zoom: 13,
  minZoom: 4,
  maxZoom: 18,
  maxBounds: boundsBrasil,
  maxBoundsViscosity: 1.0
});

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.classList.toggle("visible");
}

map.on('click', async function (e) {
  selectedLocation = e.latlng;
  document.getElementById("add-btn").style.display = "block";

  try {
    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${e.latlng.lat}&lon=${e.latlng.lng}`);
    const data = await res.json();

    selectedAddress = data.display_name || "Endereço não encontrado";
    const info = data.address;

    document.getElementById("logradouro").innerText = `Rua: ${info.road || "Não disponível"}`;
    document.getElementById("cidade").innerText = `Cidade: ${info.city || info.town || info.village || "Não disponível"}`;
    document.getElementById("cep").innerText = `CEP: ${info.postcode || "Não disponível"}`;

    document.getElementById("sidebar").classList.add("visible");
  } catch (err) {
    alert("Erro ao obter endereço.");
  }
});

document.getElementById('close-btn').addEventListener('click', () => {
  document.getElementById('form-modal').classList.add('hidden');
  document.getElementById("photo-preview").innerHTML = "";
});

document.getElementById('report-form').addEventListener('submit', function (e) {
  e.preventDefault();
  if (!selectedLocation) {
    alert("Clique em um ponto do mapa antes de registrar.");
    return;
  }
  const description = document.getElementById('description').value;
  const category = document.getElementById('category').value;
  const photoFile = document.getElementById('photo').files[0];
  const reader = new FileReader();

  reader.onloadend = function () {
    const report = {
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      address: selectedAddress,
      description,
      category,
      photo: reader.result,
      timestamp: new Date().toISOString(),
      autorCPF: localStorage.getItem("usuarioLogado")
    };
    saveReport(report);
    addMarker(report);
    gerarBotoesDeFiltro();
  };

  if (photoFile) reader.readAsDataURL(photoFile);
  else {
    const report = {
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      address: selectedAddress,
      description,
      category,
      photo: null,
      timestamp: new Date().toISOString(),
      autorCPF: localStorage.getItem("usuarioLogado")
    };
    saveReport(report);
    addMarker(report);
    gerarBotoesDeFiltro();
  }

  selectedLocation = null;
  selectedAddress = "";
  document.getElementById('form-modal').classList.add('hidden');
  this.reset();
});

function abrirFormulario() {
  document.getElementById("form-modal").classList.remove("hidden");
}

function saveReport(report) {
  const reports = JSON.parse(localStorage.getItem("reports") || "[]");
  reports.push(report);
  localStorage.setItem("reports", JSON.stringify(reports));
}

function addMarker(report) {
  L.marker([report.lat, report.lng]).addTo(map).bindPopup(`
    <b>${report.category}</b><br>
    ${report.description}<br>
    <i>${report.address}</i><br>
    <small>${new Date(report.timestamp).toLocaleString()}</small>
  `);
}

function gerarBotoesDeFiltro() {
  const container = document.getElementById("category-filter");
  const reports = JSON.parse(localStorage.getItem("reports") || "[]");
  const categorias = [...new Set(reports.map(r => r.category))];
  container.innerHTML = "";

  categorias.forEach(categoria => {
    const btn = document.createElement("button");
    btn.innerText = categoria;
    btn.onclick = () => exibirProblemasPorCategoria(categoria);
    container.appendChild(btn);
  });
}

function exibirProblemasPorCategoria(categoria) {
  const reports = JSON.parse(localStorage.getItem("reports") || "[]");
  const container = document.getElementById("filtered-list");
  container.innerHTML = "";

  const filtrados = reports.filter(r => r.category === categoria);

  if (filtrados.length === 0) {
    container.innerHTML = "<p>Nenhum registro encontrado.</p>";
    return;
  }

    filtrados.forEach(report => {
    const div = document.createElement("div");
    div.className = "item";
    div.innerHTML = `
      <strong>${report.description}</strong><br>
      <small>${report.address}</small><br>
      ${report.photo ? `<img src="${report.photo}" width="100%" style="margin-top:5px;border-radius:6px;">` : ""}
      ${
        (report.autorCPF === localStorage.getItem("usuarioLogado") || localStorage.getItem("isAdmin") === "true") 
        ? `<button onclick="excluirProblema('${report.timestamp}')">Excluir</button>` 
       : ""
      }
    `;
    container.appendChild(div);
  });
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  localStorage.removeItem("isAdmin");
  window.location.href = baseURL + "login.html";
}

window.onload = () => {
  const reports = JSON.parse(localStorage.getItem("reports") || "[]");
  reports.forEach(r => addMarker(r));
  gerarBotoesDeFiltro();
};

function excluirProblema(timestamp) {
  let reports = JSON.parse(localStorage.getItem("reports") || "[]");
  reports = reports.filter(r => r.timestamp !== timestamp);
  localStorage.setItem("reports", JSON.stringify(reports));

  alert("Problema excluído com sucesso!");

  // Atualiza marcadores no mapa
  map.eachLayer(layer => {
    if (layer instanceof L.Marker) {
      map.removeLayer(layer);
    }
  });

  // Recria os marcadores restantes
  reports.forEach(r => addMarker(r));
  gerarBotoesDeFiltro();
}

async function buscarEndereco() {
  const query = document.getElementById("search-input").value.trim();

  if (!query) {
    alert("Digite o nome de uma rua para buscar.");
    return;
  }

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)} Curitiba Brasil`);
    const resultados = await response.json();

    if (resultados.length === 0) {
      alert("Endereço não encontrado. Tente um nome de rua mais específico.");
      return;
    }

    const primeiroResultado = resultados[0];
    const lat = parseFloat(primeiroResultado.lat);
    const lon = parseFloat(primeiroResultado.lon);

    // Centraliza o mapa
    map.setView([lat, lon], 17);

    // Atualiza informações da barra lateral
    document.getElementById("logradouro").innerText = `Rua: ${primeiroResultado.display_name}`;
    document.getElementById("cidade").innerText = "";
    document.getElementById("cep").innerText = "";
    document.getElementById("sidebar").classList.add("visible");

    // Habilita o botão de adicionar problema
    selectedLocation = { lat: lat, lng: lon };  // Define a posição para o registro
    selectedAddress = primeiroResultado.display_name;  // Define o endereço para o registro
    document.getElementById("add-btn").style.display = "block";

  } catch (error) {
    console.error(error);
    alert("Erro ao buscar o endereço. Verifique sua conexão.");
  }
}

function salvarProblema() {
  const descricao = document.getElementById("descricao").value.trim();
  const tipo = document.getElementById("tipo").value;
  const fileInput = document.getElementById("foto");

  if (!descricao || !tipo || !selectedLocation || !selectedAddress) {
    alert("Por favor, preencha todos os campos obrigatórios e selecione uma localização no mapa.");
    return;
  }

  converterImagemParaBase64(fileInput, function(base64Imagem) {
    const reports = JSON.parse(localStorage.getItem("reports") || "[]");

    reports.push({
      description: descricao,
      type: tipo,
      photo: base64Imagem,  // Agora a imagem está em formato Base64
      lat: selectedLocation.lat,
      lng: selectedLocation.lng,
      address: selectedAddress,
      timestamp: Date.now(),
      autorCPF: localStorage.getItem("usuarioLogado")
    });

    localStorage.setItem("reports", JSON.stringify(reports));

    alert("Problema registrado com sucesso!");
    location.reload();
  });
}

