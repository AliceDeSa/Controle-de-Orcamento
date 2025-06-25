// =====================================================
// Definição das Categorias de Metas e Variáveis Globais
// =====================================================
const categoriasMetas = {
  "meta-custo": {
    label: "Custo fixo",
    initialValue: 40,
    color: "#3498db",
    recommendation: "(50% a 60%)",
    description:
      "Despesas essenciais e fixas. Ex: Aluguel, contas de luz/água, transporte, Financiamento, alimentação básica.",
    placeholder: "Ex: Aluguel, Luz, Água"
  },
  "meta-conforto": {
    label: "Conforto",
    initialValue: 20,
    color: "#1abc9c",
    recommendation: "(10% a 20%)",
    description:
      "Gastos para melhorar seu bem-estar diário e pequenas conveniências. Ex: Assinaturas de streaming, academia, eletrodomésticos, pequenos mimos.",
    placeholder: "Ex: Netflix, Academia, Delivery"
  },
  "meta-conhecimento": {
    label: "Conhecimento",
    initialValue: 5,
    color: "#9b59b6",
    recommendation: "(5% a 10%)",
    description:
      "Investimentos em educação, cursos, livros ou workshops para seu desenvolvimento pessoal e profissional.",
    placeholder: "Ex: Curso, Livro, Workshop"
  },
  "meta-prazer": {
    label: "Prazeres",
    initialValue: 10,
    color: "#f39c12",
    recommendation: "(5% a 10%)",
    description:
      "Dinheiro para hobbies, viagens, experiências e luxos que trazem alegria. Ex: jantares fora, eventos, eletrônicos.",
    placeholder: "Ex: Cinema, Viagem, Jantar"
  },
  "meta-liberdade": {
    label: "Liberdade Financeira",
    initialValue: 20,
    color: "#2ecc71",
    recommendation: "(15% a 25%)",
    description:
      "Economias e investimentos para construir segurança financeira e independência futura. Ex: reserva de emergência, aposentadoria, investimentos de longo prazo.",
    placeholder: "Ex: Poupança, Ações, Previdência"
  },
  "meta-metas": {
    label: "Metas",
    initialValue: 5,
    color: "#f1c40f",
    recommendation: "(5% a 15%)",
    description:
      "Verba destinada a objetivos específicos de curto ou médio prazo. Ex: compra de carro, entrada de imóvel, intercâmbio, grandes viagens.",
    placeholder: "Ex: Carro, Viagem, Imóvel"
  }
};
const MIN_RENDA = 1518;
let graficoPizzaInstance;
let graficoTela2Instance;
let feedbackTimeoutId;
let gastosReais = {
  "Custo fixo": [],
  Conforto: [],
  Conhecimento: [],
  Prazeres: [],
  "Liberdade Financeira": [],
  Metas: []
};

// =====================================================
// Funções de atualização de sliders, feedback e validação de metas
// -----------------------------------------------------

function atualizaSlider(slider) {
  const id = slider.id.replace("meta-", "val-");
  document.getElementById(id).textContent = `${slider.value}%`;
  slider.style.setProperty("--slider-fill", `${slider.value}%`);
  atualizarGraficoPizza();
  atualizarTotal();
}

function atualizarTotal() {
  const data = obterDadosSliders();
  const total = data.reduce((sum, value) => sum + value, 0);
  const totalDiv = document.getElementById("total-porcentagem");
  totalDiv.textContent = `${total}%`;
  const totalDivTela2 = document.getElementById("total-porcentagem-tela2");
  if (totalDivTela2) {
    totalDivTela2.textContent = `${total}%`;
  }
  if (total === 100) {
    totalDiv.style.color = "white";
    if (totalDivTela2) totalDivTela2.style.color = "white";
    const feedbackDiv = document.getElementById("feedback-salvar");
    if (feedbackDiv.textContent.includes("soma das porcentagens")) {
      hideFeedback();
    }
  } else {
    totalDiv.style.color = "#e74c3c";
    if (totalDivTela2) totalDivTela2.style.color = "#e74c3c";
    showFeedback(
      `A soma das porcentagens deve ser 100%. Atualmente: ${total}%.`,
      "error",
      0
    );
  }
}

function hideFeedback() {
  const feedbackDiv = document.getElementById("feedback-salvar");
  feedbackDiv.classList.remove("show", "feedback-success", "feedback-error");
  feedbackDiv.textContent = "";
}

function showFeedback(message, type, duration = 5000) {
  const feedbackDiv = document.getElementById("feedback-salvar");
  clearTimeout(feedbackTimeoutId);
  hideFeedback();
  feedbackDiv.textContent = message;
  feedbackDiv.classList.add(`feedback-${type}`);
  feedbackDiv.classList.add("show");
  if (duration > 0) {
    feedbackTimeoutId = setTimeout(() => {
      hideFeedback();
    }, duration);
  }
}

function salvarMetas() {
  hideFeedback();
  const data = obterDadosSliders();
  const totalPorcentagens = data.reduce((sum, value) => sum + value, 0);
  const inputRendaElement = document.getElementById("inputRenda");
  const rendaNumerica = parseFloat(inputRendaElement.dataset.rawValue || "0");
  if (totalPorcentagens !== 100) {
    atualizarTotal();
    return;
  }
  if (rendaNumerica < MIN_RENDA) {
    showFeedback("Por favor, informe uma renda mensal válida.", "error");
    return;
  }
  const metasParaSalvar = {};
  for (const id in categoriasMetas) {
    metasParaSalvar[id] = parseInt(document.getElementById(id).value);
  }
  localStorage.setItem("metasUsuario", JSON.stringify(metasParaSalvar));
  localStorage.setItem("rendaMensal", rendaNumerica.toFixed(2));
  showFeedback("Metas e Renda salvas com sucesso!", "success");
  setTimeout(mostrarTela2, 3000);
}

function resetarValores() {
  hideFeedback();
  document.querySelectorAll("input[type=range]").forEach((slider) => {
    const valor = categoriasMetas[slider.id].initialValue;
    slider.value = valor;
    atualizaSlider(slider);
  });
  const inputRenda = document.getElementById("inputRenda");
  inputRenda.value = "0,00";
  inputRenda.dataset.rawValue = "0.00";
  localStorage.removeItem("rendaMensal");
  localStorage.removeItem("metasUsuario");
  localStorage.removeItem("gastosReais");
  gastosReais = {
    "Custo fixo": [],
    Conforto: [],
    Conhecimento: [],
    Prazeres: [],
    "Liberdade Financeira": [],
    Metas: []
  };
  showFeedback("Valores resetados para o padrão!", "success");
}

function gerarCoresCategorias() {
  return Object.values(categoriasMetas).map((meta) => meta.color);
}

function obterDadosSliders() {
  return Object.keys(categoriasMetas).map((id) =>
    parseInt(document.getElementById(id).value)
  );
}

function obterRotulosCategorias() {
  return Object.values(categoriasMetas).map((meta) => meta.label);
}

// =====================================================
// Funções de Gráficos (Chart.js)
// =====================================================
// Funções para criar e atualizar os gráficos de pizza das telas

function criarGraficoPizza(ctx, instanceVarName) {
  const data = obterDadosSliders();
  const labels = obterRotulosCategorias();
  const colors = gerarCoresCategorias();
  let currentInstance = window[instanceVarName];
  if (currentInstance) {
    currentInstance.destroy();
  }
  window[instanceVarName] = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labels,
      datasets: [
        {
          data: data,
          backgroundColor: colors,
          borderColor: "#2b2f36",
          borderWidth: 2
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      cutout: "70%",
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.label || "";
              if (label) {
                label += ": ";
              }
              if (context.parsed !== null) {
                label += context.parsed + "%";
              }
              return label;
            }
          }
        }
      }
    }
  });
}

function atualizarGraficoPizza() {
  const ctx1 = document.getElementById("graficoPizza").getContext("2d");
  criarGraficoPizza(ctx1, "graficoPizzaInstance");
}

function atualizarGraficoTela2() {
  const ctx2 = document.getElementById("graficoTela2").getContext("2d");
  criarGraficoPizza(ctx2, "graficoTela2Instance");
}

// =====================================================
// Funções de Armazenamento Local (localStorage)
// =====================================================
// Carregamento e salvamento de dados do usuário

function carregarValoresSalvos() {
  const metasSalvas = localStorage.getItem("metasUsuario");
  if (metasSalvas) {
    const parsedMetas = JSON.parse(metasSalvas);
    for (const id in parsedMetas) {
      const slider = document.getElementById(id);
      if (slider) {
        slider.value = parsedMetas[id];
      }
    }
  }
  const inputRendaElement = document.getElementById("inputRenda");
  const rendaSalvaRaw = localStorage.getItem("rendaMensal");
  if (rendaSalvaRaw) {
    const numericValue = parseFloat(rendaSalvaRaw);
    inputRendaElement.dataset.rawValue = numericValue.toFixed(2);
    inputRendaElement.value = formatarValorParaExibicao(numericValue);
  } else {
    inputRendaElement.dataset.rawValue = "0.00";
    inputRendaElement.value = "0,00";
  }
  const gastosSalvos = localStorage.getItem("gastosReais");
  if (gastosSalvos) {
    try {
      const parsedGastos = JSON.parse(gastosSalvos);
      for (const key in categoriasMetas) {
        const categoryLabel = categoriasMetas[key].label;
        if (parsedGastos[categoryLabel]) {
          gastosReais[categoryLabel] = parsedGastos[categoryLabel];
        } else {
          gastosReais[categoryLabel] = [];
        }
      }
    } catch (e) {
      console.error("Erro ao fazer parse de gastosReais do Local Storage:", e);
      for (const key in categoriasMetas) {
        const categoryLabel = categoriasMetas[key].label;
        gastosReais[categoryLabel] = [];
      }
      localStorage.removeItem("gastosReais");
    }
  }
}

// =====================================================
// Funções de Tooltips e Utilitários de Formatação
// =====================================================
// Funções para tooltips, formatação de valores e inputs

function setupSliderTooltip(sliderContainer) {
  const tooltipText = sliderContainer.getAttribute("data-tooltip");
  if (!tooltipText) return;
  const tooltipDiv = document.createElement("div");
  tooltipDiv.className = "tooltip";
  tooltipDiv.textContent = tooltipText;
  sliderContainer.appendChild(tooltipDiv);
}

function setupCategoryTooltip(element, tooltipText) {
  const tooltipDiv = document.createElement("div");
  tooltipDiv.className = "tooltip";
  tooltipDiv.textContent = tooltipText;
  element.appendChild(tooltipDiv);
  element.setAttribute("data-tooltip", tooltipText);
}

function formatarValorParaExibicao(valorNumerico) {
  valorNumerico = parseFloat(valorNumerico);
  if (isNaN(valorNumerico)) {
    valorNumerico = 0;
  }
  return valorNumerico.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function limparRendaAoFocar(event) {
  const input = event.target;
  input.value = (input.dataset.rawValue || "0.00").replace(".", ",");
  input.select();
}

function formatarRendaAoDigitar(event) {
  const input = event.target;
  let value = input.value;
  const originalSelectionStart = input.selectionStart;
  value = value.replace(/[^0-9,]/g, "");
  const parts = value.split(",");
  if (parts.length > 2) {
    value = parts[0] + "," + parts.slice(1).join("");
  }
  if (parts[0].length > 1 && parts[0].startsWith("0") && parts[0] !== "0") {
    parts[0] = parts[0].replace(/^0+/, "");
    value = parts.join(",");
  } else if (parts[0] === "" && parts.length > 1) {
    value = "0," + parts[1];
  }
  if (value.includes(",")) {
    let decimalPart = value.split(",")[1];
    if (decimalPart.length > 2) {
      value = value.split(",")[0] + "," + decimalPart.substring(0, 2);
    }
  }
  let numericValue = parseFloat(value.replace(",", ".") || "0");
  if (isNaN(numericValue)) {
    numericValue = 0;
  }
  input.dataset.rawValue = numericValue.toFixed(2);
  let displayValue = value;
  if (value.includes(",")) {
    const [integer, decimal] = value.split(",");
    displayValue = integer + "," + decimal;
  } else if (value !== "") {
    displayValue = value;
  } else {
    displayValue = "";
  }
  if (displayValue === "0" && event.data && event.data.match(/[1-9]/)) {
    displayValue = event.data;
  }
  const oldVal = input.value;
  input.value = displayValue;
  const newVal = input.value;
  let newSelectionStart = originalSelectionStart;
  if (
    newVal.length > oldVal.length &&
    originalSelectionStart === oldVal.length
  ) {
    newSelectionStart += newVal.length - oldVal.length;
  } else if (
    newVal.length < oldVal.length &&
    originalSelectionStart === oldVal.length
  ) {
    newSelectionStart -= oldVal.length - newVal.length;
  }
  input.setSelectionRange(newSelectionStart, newSelectionStart);
}

function formatarRendaAoSairFoco(event) {
  const input = event.target;
  let numericValue = parseFloat(input.dataset.rawValue || "0");
  if (isNaN(numericValue)) {
    numericValue = 0;
  }
  input.value = formatarValorParaExibicao(numericValue);
}

// =====================================================
// Funções de formatação de valores de gastos (usadas dinamicamente)
// =====================================================
function formatarValorGastoAoDigitar(event) {
  const input = event.target;
  let value = input.value;
  const originalSelectionStart = input.selectionStart;
  value = value.replace(/[^0-9,]/g, "");
  const parts = value.split(",");
  if (parts.length > 2) {
    value = parts[0] + "," + parts.slice(1).join("");
  }
  if (parts[0].length > 1 && parts[0].startsWith("0") && parts[0] !== "0") {
    parts[0] = parts[0].replace(/^0+/, "");
    value = parts.join(",");
  } else if (parts[0] === "" && parts.length > 1) {
    value = "0," + parts[1];
  }
  if (value.includes(",")) {
    let decimalPart = value.split(",")[1];
    if (decimalPart.length > 2) {
      value = value.split(",")[0] + "," + decimalPart.substring(0, 2);
    }
  }
  let displayValue = value;
  if (value.includes(",")) {
    const [integer, decimal] = value.split(",");
    displayValue = integer + "," + decimal;
  } else if (value !== "") {
    displayValue = value;
  } else {
    displayValue = "";
  }
  if (displayValue === "0" && event.data && event.data.match(/[1-9]/)) {
    displayValue = event.data;
  }
  const oldVal = input.value;
  input.value = displayValue;
  const newVal = input.value;
  let newSelectionStart = originalSelectionStart;
  if (
    newVal.length > oldVal.length &&
    originalSelectionStart === oldVal.length
  ) {
    newSelectionStart += newVal.length - oldVal.length;
  } else if (
    newVal.length < oldVal.length &&
    originalSelectionStart === oldVal.length
  ) {
    newSelectionStart -= oldVal.length - newVal.length;
  }
  input.setSelectionRange(newSelectionStart, newSelectionStart);
}

function formatarValorGastoAoSairFoco(event) {
  const input = event.target;
  let numericValue = parseFloat(input.value.replace(",", ".") || "0");
  if (isNaN(numericValue)) {
    numericValue = 0;
  }
  input.value = formatarValorParaExibicao(numericValue);
}

function limparValorGastoAoFocar(event) {
  const input = event.target;
  input.value = input.value.replace(/\./g, "");
  input.select();
}

// =====================================================
// Funções da TELA 2: Orçamento Doméstico
// =====================================================
// Renderização de categorias, itens, totais e manipulação de gastos

function mostrarTela2() {
  const rendaSalva = localStorage.getItem("rendaMensal");
  const metasSalvas = localStorage.getItem("metasUsuario");
  if (!rendaSalva || !metasSalvas) {
    showFeedback(
      "Por favor, salve suas metas e renda na Tela 1 antes de continuar.",
      "error",
      5000
    );
    return;
  }
  document.getElementById("tela1").classList.add("hidden");
  document.getElementById("tela2").classList.remove("hidden");

  const gastosSalvos = localStorage.getItem("gastosReais");
  if (gastosSalvos) {
    try {
      const parsedGastos = JSON.parse(gastosSalvos);
      for (const key in categoriasMetas) {
        const categoryLabel = categoriasMetas[key].label;
        if (parsedGastos[categoryLabel]) {
          gastosReais[categoryLabel] = parsedGastos[categoryLabel];
        } else {
          gastosReais[categoryLabel] = [];
        }
      }
    } catch (e) {
      console.error("Erro ao fazer parse de gastosReais do Local Storage:", e);
      for (const key in categoriasMetas) {
        const categoryLabel = categoriasMetas[key].label;
        gastosReais[categoryLabel] = [];
      }
      localStorage.removeItem("gastosReais");
    }
  } else {
    for (const key in categoriasMetas) {
      const categoryLabel = categoriasMetas[key].label;
      gastosReais[categoryLabel] = [];
    }
  }
  renderizarMetasValoresFixos();
  renderizarSecoesGastos();
  atualizarTabelaResumo();
  atualizarGraficoTela2();
  atualizarTotal();
}

function renderizarMetasValoresFixos() {
  const metas = JSON.parse(localStorage.getItem("metasUsuario"));
  const metasValoresFixosDiv = document.getElementById("metasValoresFixos");
  let htmlContent = `
        <h2>Metas</h2>
        <div class="card-content">
    `;
  for (const chave in categoriasMetas) {
    const nomeDisplay = categoriasMetas[chave].label;
    const percentual = metas[chave];
    htmlContent += `<p><strong>${nomeDisplay}:</strong> <span>${percentual}%</span></p>`;
  }
  htmlContent += `</div>
                    <button class="editar-metas" onclick="voltarTela1()">Editar Metas</button>
                    `;
  metasValoresFixosDiv.innerHTML = htmlContent;
}

function renderizarSecoesGastos() {
  const detalhamentoCategoriasDiv = document.getElementById(
    "detalhamentoCategorias"
  );
  detalhamentoCategoriasDiv.innerHTML = "";
  for (const chaveMeta in categoriasMetas) {
    const metaInfo = categoriasMetas[chaveMeta];
    const nomeDisplay = metaInfo.label;
    const description = metaInfo.description;
    const sectionHtml = `
                            <div class="card-section">
                                <h2 id="title-${nomeDisplay.replace(
                                  /\s/g,
                                  ""
                                )}">
                                    ${nomeDisplay}
                                </h2>
                                
                                <div class="add-item-controls">
                                    <div class="input-field-group">
                                        <label for="descricao-${nomeDisplay.replace(
                                          /\s/g,
                                          ""
                                        )}">Descrição:</label>
                                        <input type="text" id="descricao-${nomeDisplay.replace(
                                          /\s/g,
                                          ""
                                        )}" placeholder="${
      metaInfo.placeholder
    }">
                                    </div>
                                    <div class="input-field-group">
                                        <label for="valorGasto-${nomeDisplay.replace(
                                          /\s/g,
                                          ""
                                        )}">Valor (R$):</label>
                                        <input type="text" id="valorGasto-${nomeDisplay.replace(
                                          /\s/g,
                                          ""
                                        )}" placeholder="Ex: 150,00">
                                    </div>
                                    <button class="adicionar" 
                                        onclick="adicionarItemGasto('${nomeDisplay}')">Adicionar</button>
                                </div>

                                <ul class="category-items-list" id="list-${nomeDisplay.replace(
                                  /\s/g,
                                  ""
                                )}">
                                </ul>
                                <div class="category-subtotal-line">
                                    <span>Total Gasto:</span>
                                    <span id="subtotal-${nomeDisplay.replace(
                                      /\s/g,
                                      ""
                                    )}">R$ ${formatarValorParaExibicao(
      0
    )}</span>
                                </div>
                            </div>
                        `;
    detalhamentoCategoriasDiv.innerHTML += sectionHtml;
  }
  for (const chaveMeta in categoriasMetas) {
    const nomeDisplay = categoriasMetas[chaveMeta].label;
    const description = categoriasMetas[chaveMeta].description;
    const inputId = `valorGasto-${nomeDisplay.replace(/\s/g, "")}`;
    const inputElement = document.getElementById(inputId);
    if (inputElement) {
      inputElement.addEventListener("input", formatarValorGastoAoDigitar);
      inputElement.addEventListener("blur", formatarValorGastoAoSairFoco);
      inputElement.addEventListener("focus", limparValorGastoAoFocar);
      formatarValorGastoAoSairFoco({
        target: inputElement
      });
    }
    const titleElement = document.getElementById(
      `title-${nomeDisplay.replace(/\s/g, "")}`
    );
    if (titleElement && description) {
      setupCategoryTooltip(titleElement, description);
    }
    renderizarItensGasto(nomeDisplay);
  }
}

function adicionarItemGasto(categoriaNome) {
  const idDescricao = `descricao-${categoriaNome.replace(/\s/g, "")}`;
  const idValor = `valorGasto-${categoriaNome.replace(/\s/g, "")}`;
  const descricaoInput = document.getElementById(idDescricao);
  const valorInput = document.getElementById(idValor);
  const descricao = descricaoInput.value.trim();
  let valorStr = valorInput.value.trim().replace(/\./g, "").replace(",", ".");
  const valor = parseFloat(valorStr || "0");
  if (!descricao || isNaN(valor) || valor <= 0) {
    alert("Por favor, preencha a descrição e um valor válido para o gasto.");
    return;
  }
  gastosReais[categoriaNome].push({
    descricao: descricao,
    valor: valor
  });
  localStorage.setItem("gastosReais", JSON.stringify(gastosReais));
  renderizarItensGasto(categoriaNome);
  atualizarTabelaResumo();
  descricaoInput.value = "";
  valorInput.value = "0,00";
}

function renderizarItensGasto(categoriaNome) {
  const listId = `list-${categoriaNome.replace(/\s/g, "")}`;
  const ulElement = document.getElementById(listId);
  ulElement.innerHTML = "";
  gastosReais[categoriaNome].forEach((item, index) => {
    const li = document.createElement("li");
    li.className = "category-item";
    li.innerHTML = `
                        <span class="item-description">${item.descricao}</span>
                        <span class="item-value">R$ ${formatarValorParaExibicao(
                          item.valor
                        )}</span>
                        <button class="item-remove-btn" onclick="removerItemGasto('${categoriaNome}', ${index})">×</button>
                    `;
    ulElement.appendChild(li);
  });
  const subtotalSpan = document.getElementById(
    `subtotal-${categoriaNome.replace(/\s/g, "")}`
  );
  const totalCategoria = calcularSubtotalGasto(categoriaNome);
  subtotalSpan.textContent = `R$ ${formatarValorParaExibicao(totalCategoria)}`;
}

function removerItemGasto(categoriaNome, index) {
  if (
    confirm(
      `Tem certeza que deseja remover "${gastosReais[categoriaNome][index].descricao}"?`
    )
  ) {
    gastosReais[categoriaNome].splice(index, 1);
    localStorage.setItem("gastosReais", JSON.stringify(gastosReais));
    renderizarItensGasto(categoriaNome);
    atualizarTabelaResumo();
  }
}

function calcularSubtotalGasto(categoriaNome) {
  return gastosReais[categoriaNome].reduce(
    (total, item) => total + item.valor,
    0
  );
}

function atualizarTabelaResumo() {
  const metas = JSON.parse(localStorage.getItem("metasUsuario"));
  const salario = parseFloat(localStorage.getItem("rendaMensal"));
  const corpoTabela = document.getElementById("tabelaResumo");
  corpoTabela.innerHTML = "";

  let totalOrcadoGeral = 0;
  let totalRealGeral = 0;

  for (const chaveMeta in categoriasMetas) {
    const nomeDisplay = categoriasMetas[chaveMeta].label;
    const percentual = metas[chaveMeta];
    const orcado = (salario * percentual) / 100;
    const real = calcularSubtotalGasto(nomeDisplay);
    const diferenca = orcado - real;

    totalOrcadoGeral += orcado;
    totalRealGeral += real;

    let diferencaFormatada = formatarValorParaExibicao(diferenca);
    let diferencaCor = "white";
    if (diferenca < 0) {
      diferencaCor = "#e74c3c";
    } else if (diferenca > 0) {
      diferencaCor = "#2ecc71";
    }

    corpoTabela.innerHTML += `
            <tr>
                <td>${nomeDisplay}</td>
                <td>R$ ${formatarValorParaExibicao(orcado)}</td>
                <td>R$ ${formatarValorParaExibicao(real)}</td>
                <td style="color: ${diferencaCor};">R$ ${diferencaFormatada}</td>
            </tr>
        `;
  }

  // Atualiza a nova seção de totais abaixo da tabela
  const totalOrcadoLabel = document.getElementById("total-orcado-label");
  const totalRealLabel = document.getElementById("total-real-label");
  const diferencaPercentualLabel = document.getElementById(
    "diferenca-percentual-label"
  );

  totalOrcadoLabel.textContent = `R$ ${formatarValorParaExibicao(
    totalOrcadoGeral
  )}`;
  totalRealLabel.textContent = `R$ ${formatarValorParaExibicao(
    totalRealGeral
  )}`;

  let diferencaTotalPercentual =
    salario > 0 ? (totalRealGeral / salario) * 100 : 0;
  diferencaPercentualLabel.textContent = `${diferencaTotalPercentual.toFixed(
    2
  )}%`;

  // Aplica cores com base na diferença total de gastos vs orçado
  if (totalRealGeral > totalOrcadoGeral) {
    totalRealLabel.classList.remove("green-text");
    totalRealLabel.classList.add("red-text");
    diferencaPercentualLabel.classList.remove("green-text");
    diferencaPercentualLabel.classList.add("red-text");
  } else {
    totalRealLabel.classList.remove("red-text");
    totalRealLabel.classList.add("green-text");
    diferencaPercentualLabel.classList.remove("red-text");
    diferencaPercentualLabel.classList.add("green-text");
  }
}

function voltarTela1() {
  document.getElementById("tela2").classList.add("hidden");
  document.getElementById("tela1").classList.remove("hidden");
  hideFeedback();
}

function baixarImagemTela2() {
  const tela2Element = document.getElementById("tela2");
  const importFileInput = document.getElementById("importFileInput");
  importFileInput.classList.add("hidden");

  html2canvas(tela2Element, {
    scale: 2,
    logging: false,
    useCORS: true,
    windowWidth: tela2Element.scrollWidth,
    windowHeight: tela2Element.scrollHeight,
    backgroundColor: "#1b1f24"
  })
    .then((canvas) => {
      importFileInput.classList.remove("hidden");

      const link = document.createElement("a");
      link.download = "orcamento_domestico.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    })
    .catch((error) => {
      console.error("Erro ao gerar imagem:", error);
      importFileInput.classList.remove("hidden");
      alert("Ocorreu um erro ao baixar a imagem. Tente novamente.");
    });
}

function exportarDados() {
  const dataToExport = {
    metasUsuario: localStorage.getItem("metasUsuario"),
    rendaMensal: localStorage.getItem("rendaMensal"),
    gastosReais: localStorage.getItem("gastosReais")
  };

  const jsonData = JSON.stringify(dataToExport, null, 2);
  const blob = new Blob([jsonData], {
    type: "application/json"
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "orcamento_domestico_dados.json";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  alert("Dados exportados com sucesso!");
}

function importarDados(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const importedData = JSON.parse(e.target.result);
      if (
        importedData.metasUsuario &&
        importedData.rendaMensal &&
        importedData.gastosReais
      ) {
        localStorage.setItem("metasUsuario", importedData.metasUsuario);
        localStorage.setItem("rendaMensal", importedData.rendaMensal);
        localStorage.setItem("gastosReais", importedData.gastosReais);

        alert("Dados importados com sucesso! A página será atualizada.");
        location.reload();
      } else {
        alert(
          "Arquivo JSON inválido. Certifique-se de que contém 'metasUsuario', 'rendaMensal' e 'gastosReais'."
        );
      }
    } catch (error) {
      alert(
        "Erro ao ler o arquivo JSON. Certifique-se de que é um arquivo JSON válido."
      );
      console.error("Erro ao importar dados:", error);
    }
  };
  reader.readAsText(file);
  event.target.value = "";
}

// =====================================================
// Inicialização do Sistema (window.onload)
// =====================================================
// Configura eventos, carrega valores e inicializa gráficos ao abrir a página

window.onload = function () {
  carregarValoresSalvos();
  document.querySelectorAll("input[type=range]").forEach((slider) => {
    slider.style.setProperty("--slider-fill", `${slider.value}%`);
    const id = slider.id.replace("meta-", "val-");
    document.getElementById(id).textContent = `${slider.value}%`;
  });
  atualizarGraficoPizza();
  atualizarTotal();
  document.querySelectorAll(".slider-container").forEach((container) => {
    setupSliderTooltip(container);
  });
  const inputRenda = document.getElementById("inputRenda");
  inputRenda.addEventListener("input", formatarRendaAoDigitar);
  inputRenda.addEventListener("blur", formatarRendaAoSairFoco);
  inputRenda.addEventListener("focus", limparRendaAoFocar);
  formatarRendaAoSairFoco({
    target: inputRenda
  });
};
