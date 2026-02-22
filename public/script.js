// Referências aos elementos da página
const container = document.getElementById("horarios");
const dataInput = document.getElementById("data");
const form = document.getElementById("form");

// Definir a data mínima como o dia de hoje
let dataAtual = new Date();
const dataInputHidden = document.getElementById("data");
const dataExibicao = document.getElementById("dataExibicao");
const btnPrev = document.getElementById("btnPrev");

// Função para formatar a data para o banco (YYYY-MM-DD)
function formatarParaISO(date) {
    return date.toISOString().split('T')[0];
}

// Função para formatar a data para o humano (Ex: Sáb, 21 de Fev)
function formatarParaExibicao(date) {
    return date.toLocaleDateString('pt-BR', { 
        weekday: 'short', 
        day: '2-digit', 
        month: 'short' 
    }).replace('.', '');
}

function atualizarInterfaceData() {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const selecionada = new Date(dataAtual);
    selecionada.setHours(0, 0, 0, 0);

    // Atualiza o texto e o input escondido
    dataExibicao.innerText = formatarParaExibicao(dataAtual);
    dataInputHidden.value = formatarParaISO(dataAtual);

    // No cliente, impede de voltar para o passado
    if (btnPrev) {
        btnPrev.disabled = selecionada <= hoje;
    }

    // Chama a função de carregar os horários (que você já tem)
    carregar();
}

function alterarData(dias) {
    dataAtual.setDate(dataAtual.getDate() + dias);
    atualizarInterfaceData();
}

// Inicia a página
atualizarInterfaceData();

async function carregar() {
    const data = dataInput.value;
    form.style.display = "none";
    horaSelecionada = null;

    try {
        const res = await fetch("/horarios/" + data);
        const livres = await res.json();

        container.innerHTML = "";

        if (livres.length === 0) {
            container.innerHTML = "<p style='text-align:center; color:#666;'>Nenhum horário disponível.</p>";
            return;
        }

        livres.forEach(h => {
            const div = document.createElement("div");
            div.className = "slot livre";
            div.innerText = h;

            div.onclick = () => {
                horaSelecionada = h;
                form.style.display = "block";
                form.scrollIntoView({ behavior: "smooth" });
            };

            container.appendChild(div);
        });
    } catch (erro) {
        container.innerHTML = "<p style='color:red;'>Erro ao ligar ao servidor.</p>";
    }
}

async function confirmar() {
    const nome = document.getElementById("nome").value.trim();
    let telefone = document.getElementById("telefone").value.trim();
    const servico = document.getElementById("servico").value;
    const email = document.getElementById("email") ? document.getElementById("email").value.trim() : "";
    const data = dataInput.value;
    const hora = horaSelecionada;

    const btn = document.getElementById("agendar-btn");
    btn.innerText = "Agendando... Aguarde";
    btn.disabled = true;

    if (!nome || !telefone) return alert("Preencha nome e WhatsApp!");
    if (!hora) return alert("Selecione um horário!");

    // Limpeza e Formatação Automática do Telefone
    telefone = telefone.replace(/\D/g, ''); // Remove ( ) - e espaços
    if (telefone.length <= 11) telefone = "55" + telefone; // Adiciona 55 se o user não pôs

    try {
        const res = await fetch("/agendar", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nome, telefone, email, servico, data, hora })
        });

        if (res.ok) {
            const dados = await res.json();
            const textoMsg = `*BARBEARIA - CONFIRMAÇÃO*
Agendado com sucesso!
Nome: ${nome}
Serviço: ${servico}
Data: ${data}
Hora: ${hora}

Para cancelar, use seu número de telefone no site.`;

            const msgFormatada = encodeURIComponent(textoMsg);
            const seuNumeroAdmin = "5584999479036";

            window.open(`https://wa.me/${seuNumeroAdmin}?text=${msgFormatada}`, '_blank');

            alert("Agendamento realizado!");
            location.reload();
        } else {
            const erroTxt = await res.text();
            alert("Erro: " + erroTxt);
        }
    } catch (erro) {
        alert("Erro de ligação.");
    }
}

async function buscarPorTelefone() {
    let tel = document.getElementById("buscaTelefone").value.trim();
    const lista = document.getElementById("resultadoBusca");

    if (!tel) return alert("Digite seu WhatsApp.");

    // TRATAMENTO DO TELEFONE NA BUSCA (Crucial!)
    tel = tel.replace(/\D/g, '');
    if (tel.length <= 11) tel = "55" + tel;

    lista.innerHTML = "Procurando...";

    try {
        const res = await fetch("/meus-agendamentos/" + tel);
        const agendamentos = await res.json();

        lista.innerHTML = "";

        if (agendamentos.length === 0) {
            lista.innerHTML = "<p style='color:#ba1a1a; text-align:center;'>Nenhum agendamento encontrado.</p>";
            return;
        }

        agendamentos.forEach(ag => {
            const item = document.createElement("div");
            item.style = "background: #fff; padding: 15px; border-radius: 10px; margin-bottom: 10px; border: 1px solid #ddd; font-size: 15px;";
            item.innerHTML = `
                <div style="font-weight: bold; color: #333;">📅 ${ag.data} às ${ag.hora}</div>
                <div style="color: #666; margin-bottom: 10px;">✂️ ${ag.servico}</div>
                <button onclick="cancelarPorId(${ag.id})" style="background: #ba1a1a; color: white; border: none; border-radius: 6px; padding: 8px 12px; cursor: pointer;">Cancelar</button>
            `;
            lista.appendChild(item);
        });
    } catch (erro) {
        lista.innerHTML = "<p style='color:red;'>Erro ao buscar.</p>";
    }
}

async function cancelarPorId(id) {
    if (confirm("Deseja cancelar este horário?")) {
        try {
            const res = await fetch("/cancelar/" + id, { method: "DELETE" });
            if (res.ok) {
                alert("Cancelado!");
                buscarPorTelefone(); // Recarrega a listinha de agendamentos 
                carregar(); // Recarrega os horários vagos no topo
            }
        } catch (erro) {
            alert("Erro ao cancelar.");
        }
    }
}

carregar();