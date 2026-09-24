// ======================================================
// CAXIENSE LOG - CONTROLE OPERACIONAL
// Firebase Authentication + Realtime Database
// ======================================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
    set,
    onValue,
    remove
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    updatePassword,
    EmailAuthProvider,
    reauthenticateWithCredential,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";


// ======================================================
// CONFIGURAÇÃO DO FIREBASE
// ======================================================

const firebaseConfig = {
    apiKey: "AIzaSyCZ3xorH3D9Z0vmIfd_zafyceLJekXJPaY",
    authDomain: "amb-e-trans-caxiense-log.firebaseapp.com",
    databaseURL: "https://amb-e-trans-caxiense-log-default-rtdb.firebaseio.com",
    projectId: "amb-e-trans-caxiense-log",
    storageBucket: "amb-e-trans-caxiense-log.firebasestorage.app",
    messagingSenderId: "194048564958",
    appId: "1:194048564958:web:af334ffd5d248ec9d76c4f"
};


// ======================================================
// INICIALIZAÇÃO
// ======================================================

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);
const auth = getAuth(app);

let usuario = null;
let todosRegistros = [];


// ======================================================
// ELEMENTOS
// ======================================================

const telaLogin = document.getElementById("telaLogin");
const sistema = document.getElementById("sistema");

const formLogin = document.getElementById("formLogin");
const loginEmail = document.getElementById("loginEmail");
const loginSenha = document.getElementById("loginSenha");
const mensagemLogin = document.getElementById("mensagemLogin");

const nomeUsuario = document.getElementById("nomeUsuario");


// ======================================================
// LOGIN
// ======================================================

formLogin?.addEventListener("submit", async (e) => {

    e.preventDefault();

    const email = loginEmail.value.trim();
    const senha = loginSenha.value;

    mensagemLogin.textContent = "Entrando...";

    try {

        await signInWithEmailAndPassword(
            auth,
            email,
            senha
        );

        mensagemLogin.textContent = "";

    } catch (erro) {

        console.error(erro);

        if (erro.code === "auth/invalid-credential") {

            mensagemLogin.textContent =
                "E-mail ou senha incorretos.";

        } else if (erro.code === "auth/too-many-requests") {

            mensagemLogin.textContent =
                "Muitas tentativas. Aguarde alguns minutos.";

        } else {

            mensagemLogin.textContent =
                "Não foi possível entrar.";

        }
    }
});


// ======================================================
// VERIFICAR USUÁRIO LOGADO
// ======================================================

onAuthStateChanged(auth, (user) => {

    usuario = user;

    if (user) {

        telaLogin?.classList.add("escondida");
        sistema?.classList.remove("escondida");

        if (nomeUsuario) {
            nomeUsuario.textContent = user.email;
        }

        carregarDashboard();
        carregarRegistros();

        definirDatasHoje();

    } else {

        telaLogin?.classList.remove("escondida");
        sistema?.classList.add("escondida");

    }

});


// ======================================================
// SAIR
// ======================================================

window.sairSistema = async function () {

    try {

        await signOut(auth);

    } catch (erro) {

        console.error(erro);

    }

};


// ======================================================
// NAVEGAÇÃO
// ======================================================

window.mostrarPagina = function (pagina) {

    const paginas = [
        "dashboard",
        "ambulancia",
        "transferencia",
        "apoio",
        "registros"
    ];

    paginas.forEach((nome) => {

        const elemento =
            document.getElementById("pagina" + nome.charAt(0).toUpperCase() + nome.slice(1));

        if (elemento) {
            elemento.classList.add("escondida");
        }

    });


    const mapa = {

        dashboard: "paginaDashboard",
        ambulancia: "paginaAmbulancia",
        transferencia: "paginaTransferencia",
        apoio: "paginaApoio",
        registros: "paginaRegistros"

    };


    const paginaSelecionada =
        document.getElementById(mapa[pagina]);

    if (paginaSelecionada) {

        paginaSelecionada.classList.remove("escondida");

    }


    document.querySelectorAll(".nav-btn").forEach((btn) => {

        btn.classList.remove("ativo");

    });


    const botao = document.querySelector(
        `[data-pagina="${pagina}"]`
    );

    if (botao) {
        botao.classList.add("ativo");
    }


    if (pagina === "dashboard") {

        carregarDashboard();

    }

    if (pagina === "registros") {

        carregarRegistros();

    }

};


// ======================================================
// DATAS
// ======================================================

function definirDatasHoje() {

    const hoje = new Date();

    const ano = hoje.getFullYear();

    const mes =
        String(hoje.getMonth() + 1).padStart(2, "0");

    const dia =
        String(hoje.getDate()).padStart(2, "0");

    const dataHoje =
        `${ano}-${mes}-${dia}`;


    const campos = [

        "dataAmbulancia",
        "dataTransferencia",
        "dataApoio"

    ];


    campos.forEach((id) => {

        const campo = document.getElementById(id);

        if (campo && !campo.value) {

            campo.value = dataHoje;

        }

    });

}


// ======================================================
// AMBULÂNCIA
// ======================================================

document
    .getElementById("formAmbulancia")
    ?.addEventListener("submit", async (e) => {

        e.preventDefault();

        if (!usuario) return;


        const registro = {

            tipo: "ambulancia",

            data:
                document.getElementById("dataAmbulancia").value,

            rotaId:
                document.getElementById("rotaAmbulancia").value.trim(),

            driver:
                document.getElementById("driverAmbulancia").value.trim(),

            cidade:
                document.getElementById("cidadeAmbulancia").value.trim(),

            pacotes:
                Number(
                    document.getElementById("pacotesAmbulancia").value
                ),

            motivo:
                document.getElementById("motivoAmbulancia").value.trim(),

            meliLiberou:
                document.getElementById("meliAmbulancia").value.trim(),

            observacoes:
                document.getElementById("obsAmbulancia").value.trim(),

            lancadoPor:
                usuario.email,

            criadoEm:
                new Date().toISOString()

        };


        try {

            const novaReferencia =
                push(ref(db, "ambulancias"));

            await set(
                novaReferencia,
                registro
            );


            alert("Ambulância registrada com sucesso!");

            e.target.reset();

            definirDatasHoje();

            carregarDashboard();
            carregarRegistros();


        } catch (erro) {

            console.error(erro);

            alert(
                "Erro ao registrar ambulância."
            );

        }

    });


// ======================================================
// TRANSFERÊNCIA
// ======================================================

document
    .getElementById("formTransferencia")
    ?.addEventListener("submit", async (e) => {

        e.preventDefault();

        if (!usuario) return;


        const registro = {

            tipo: "transferencia",

            data:
                document.getElementById("dataTransferencia").value,

            rotaId:
                document.getElementById("rotaTransferencia").value.trim(),

            driverInicial:
                document.getElementById("driverInicial").value.trim(),

            driverSubstituto:
                document.getElementById("driverSubstituto").value.trim(),

            cidade:
                document.getElementById("cidadeTransferencia").value.trim(),

            motivo:
                document.getElementById("motivoTransferencia").value.trim(),

            meliLiberou:
                document.getElementById("meliTransferencia").value.trim(),

            observacoes:
                document.getElementById("obsTransferencia").value.trim(),

            lancadoPor:
                usuario.email,

            criadoEm:
                new Date().toISOString()

        };


        try {

            const novaReferencia =
                push(ref(db, "transferencias"));

            await set(
                novaReferencia,
                registro
            );


            alert(
                "Transferência registrada com sucesso!"
            );

            e.target.reset();

            definirDatasHoje();

            carregarDashboard();
            carregarRegistros();


        } catch (erro) {

            console.error(erro);

            alert(
                "Erro ao registrar transferência."
            );

        }

    });


// ======================================================
// APOIO DE ROTA
// ======================================================

document
    .getElementById("formApoio")
    ?.addEventListener("submit", async (e) => {

        e.preventDefault();

        if (!usuario) return;


        const registro = {

            tipo: "apoio",

            data:
                document.getElementById("dataApoio").value,

            rotaId:
                document.getElementById("rotaApoio").value.trim(),

            valor:
                Number(
                    document.getElementById("valorApoio").value
                ),

            driverRealiza:
                document
                    .getElementById("driverRealizaApoio")
                    .value
                    .trim(),

            driverPrecisa:
                document
                    .getElementById("driverPrecisaApoio")
                    .value
                    .trim(),

            quemLiberou:
                document
                    .getElementById("quemLiberouApoio")
                    .value
                    .trim(),

            observacoes:
                document
                    .getElementById("obsApoio")
                    .value
                    .trim(),

            lancadoPor:
                usuario.email,

            criadoEm:
                new Date().toISOString()

        };


        try {

            const novaReferencia =
                push(ref(db, "apoios"));

            await set(
                novaReferencia,
                registro
            );


            alert(
                "Apoio de rota registrado com sucesso!"
            );


            e.target.reset();

            definirDatasHoje();

            carregarDashboard();
            carregarRegistros();


        } catch (erro) {

            console.error(erro);

            alert(
                "Erro ao registrar apoio."
            );

        }

    });


// ======================================================
// DASHBOARD
// ======================================================

async function carregarDashboard() {

    try {

        const caminhos = [

            "ambulancias",
            "transferencias",
            "apoios"

        ];


        let totalAmbulancias = 0;
        let totalTransferencias = 0;
        let totalApoios = 0;


        for (const caminho of caminhos) {

            await new Promise((resolve) => {

                onValue(
                    ref(db, caminho),
                    (snapshot) => {

                        const dados =
                            snapshot.val() || {};

                        const quantidade =
                            Object.keys(dados).length;


                        if (caminho === "ambulancias") {

                            totalAmbulancias =
                                quantidade;

                        }

                        if (caminho === "transferencias") {

                            totalTransferencias =
                                quantidade;

                        }

                        if (caminho === "apoios") {

                            totalApoios =
                                quantidade;

                        }


                        atualizarNumero(
                            "totalAmbulancias",
                            totalAmbulancias
                        );

                        atualizarNumero(
                            "totalTransferencias",
                            totalTransferencias
                        );

                        atualizarNumero(
                            "totalApoios",
                            totalApoios
                        );


                        const totalGeral =
                            totalAmbulancias +
                            totalTransferencias +
                            totalApoios;


                        atualizarNumero(
                            "totalGeral",
                            totalGeral
                        );


                        resolve();

                    },
                    {
                        onlyOnce: true
                    }
                );

            });

        }


    } catch (erro) {

        console.error(
            "Erro ao carregar dashboard:",
            erro
        );

    }

}


// ======================================================
// ATUALIZAR NÚMEROS
// ======================================================

function atualizarNumero(id, valor) {

    const elemento =
        document.getElementById(id);

    if (!elemento) return;

    elemento.textContent = valor;

}


// ======================================================
// CARREGAR REGISTROS
// ======================================================

function carregarRegistros() {

    const fontes = [

        {
            caminho: "ambulancias",
            tipo: "ambulancia"
        },

        {
            caminho: "transferencias",
            tipo: "transferencia"
        },

        {
            caminho: "apoios",
            tipo: "apoio"
        }

    ];


    const registros = [];

    let carregados = 0;


    fontes.forEach((fonte) => {

        onValue(
            ref(db, fonte.caminho),
            (snapshot) => {

                const dados =
                    snapshot.val() || {};


                Object.entries(dados).forEach(
                    ([id, item]) => {

                        registros.push({

                            ...item,

                            id: id,

                            fonte: fonte.caminho,

                            tipo:
                                item.tipo ||
                                fonte.tipo

                        });

                    }
                );


                carregados++;


                if (carregados === fontes.length) {

                    todosRegistros =
                        registros.sort(
                            (a, b) =>
                                new Date(b.criadoEm || b.data) -
                                new Date(a.criadoEm || a.data)
                        );


                    exibirRegistros();

                }

            },
            {
                onlyOnce: true
            }
        );

    });

}


// ======================================================
// EXIBIR REGISTROS
// ======================================================

function exibirRegistros() {

    const container =
        document.getElementById("listaRegistros");


    if (!container) return;


    const filtroData =
        document
            .getElementById("filtroData")
            ?.value
            .trim()
            .toLowerCase() || "";


    const filtroRota =
        document
            .getElementById("filtroRota")
            ?.value
            .trim()
            .toLowerCase() || "";


    const filtroDriver =
        document
            .getElementById("filtroDriver")
            ?.value
            .trim()
            .toLowerCase() || "";


    const filtroTipo =
        document
            .getElementById("filtroTipo")
            ?.value || "";


    const filtrados =
        todosRegistros.filter((registro) => {


            const data =
                String(
                    registro.data || ""
                ).toLowerCase();


            const rota =
                String(
                    registro.rotaId || ""
                ).toLowerCase();


            let drivers = "";


            if (registro.tipo === "ambulancia") {

                drivers =
                    String(
                        registro.driver || ""
                    ).toLowerCase();

            }


            if (registro.tipo === "transferencia") {

                drivers =
                    (
                        String(
                            registro.driverInicial || ""
                        ) +
                        " " +
                        String(
                            registro.driverSubstituto || ""
                        )
                    ).toLowerCase();

            }


            if (registro.tipo === "apoio") {

                drivers =
                    (
                        String(
                            registro.driverRealiza || ""
                        ) +
                        " " +
                        String(
                            registro.driverPrecisa || ""
                        )
                    ).toLowerCase();

            }


            const correspondeData =
                !filtroData ||
                data.includes(filtroData);


            const correspondeRota =
                !filtroRota ||
                rota.includes(filtroRota);


            const correspondeDriver =
                !filtroDriver ||
                drivers.includes(filtroDriver);


            const correspondeTipo =
                !filtroTipo ||
                registro.tipo === filtroTipo;


            return (
                correspondeData &&
                correspondeRota &&
                correspondeDriver &&
                correspondeTipo
            );

        });


    if (filtrados.length === 0) {

        container.innerHTML = `
            <div class="sem-registros">
                <div class="icone-vazio">📋</div>
                <h3>Nenhum registro encontrado</h3>
                <p>Não existem registros para os filtros selecionados.</p>
            </div>
        `;

        return;

    }


    container.innerHTML =
        filtrados.map(
            montarCardRegistro
        ).join("");

}


// ======================================================
// CARD DOS REGISTROS
// ======================================================

function montarCardRegistro(registro) {

    let titulo = "";
    let icone = "";
    let detalhes = "";


    if (registro.tipo === "ambulancia") {

        titulo = "Ambulância";
        icone = "🚑";


        detalhes = `

            <div class="detalhe">
                <strong>📅 Data</strong>
                <span>${registro.data || "-"}</span>
            </div>

            <div class="detalhe">
                <strong>🛣️ Rota</strong>
                <span>${registro.rotaId || "-"}</span>
            </div>

            <div class="detalhe">
                <strong>👤 Driver</strong>
                <span>${registro.driver || "-"}</span>
            </div>

            <div class="detalhe">
                <strong>📍 Cidade</strong>
                <span>${registro.cidade || "-"}</span>
            </div>

            <div class="detalhe">
                <strong>📦 Pacotes</strong>
                <span>${registro.pacotes ?? 0}</span>
            </div>

            <div class="detalhe">
                <strong>⚠️ Motivo</strong>
                <span>${registro.motivo || "-"}</span>
            </div>

            <div class="detalhe">
                <strong>👨‍💼 Meli liberou</strong>
                <span>${registro.meliLiberou || "-"}</span>
            </div>

        `;

    }


    if (registro.tipo === "transferencia") {

        titulo = "Transferência";
        icone = "🔄";


        detalhes = `

            <div class="detalhe">
                <strong>📅 Data</strong>
                <span>${registro.data || "-"}</span>
            </div>

            <div class="detalhe">
                <strong>🛣️ Rota</strong>
                <span>${registro.rotaId || "-"}</span>
            </div>

            <div class="detalhe">
                <strong>👤 Driver inicial</strong>
                <span>${registro.driverInicial || "-"}</span>
            </div>

            <div class="detalhe">
                <strong>👤 Substituto</strong>
                <span>${registro.driverSubstituto || "-"}</span>
            </div>

            <div class="detalhe">
                <strong>📍 Cidade</strong>
                <span>${registro.cidade || "-"}</span>
            </div>

            <div class="detalhe">
                <strong>⚠️ Motivo</strong>
                <span>${registro.motivo || "-"}</span>
            </div>

            <div class="detalhe">
                <strong>👨‍💼 Meli liberou</strong>
                <span>${registro.meliLiberou || "-"}</span>
            </div>

        `;

    }


    if (registro.tipo === "apoio") {

        titulo = "Apoio de Rota";
        icone = "🤝";


        const valor =
            Number(registro.valor || 0)
                .toLocaleString(
                    "pt-BR",
                    {
                        style: "currency",
                        currency: "BRL"
                    }
                );


        detalhes = `

            <div class="detalhe">
                <strong>📅 Data</strong>
                <span>${registro.data || "-"}</span>
            </div>

            <div class="detalhe">
                <strong>🛣️ Rota</strong>
                <span>${registro.rotaId || "-"}</span>
            </div>

            <div class="detalhe destaque-valor">
                <strong>💰 Valor</strong>
                <span>${valor}</span>
            </div>

            <div class="detalhe">
                <strong>🚚 Driver que realizou</strong>
                <span>${registro.driverRealiza || "-"}</span>
            </div>

            <div class="detalhe">
                <strong>🚚 Driver que precisava</strong>
                <span>${registro.driverPrecisa || "-"}</span>
            </div>

            <div class="detalhe">
                <strong>👨‍💼 Quem liberou</strong>
                <span>${registro.quemLiberou || "-"}</span>
            </div>

        `;

    }


    return `

        <div class="card-registro">

            <div class="card-registro-header">

                <div class="titulo-registro">

                    <span class="icone-registro">
                        ${icone}
                    </span>

                    <div>

                        <h3>
                            ${titulo}
                        </h3>

                        <small>
                            Registro operacional
                        </small>

                    </div>

                </div>


                <button
                    class="btn-excluir"
                    onclick="excluirRegistro('${registro.fonte}', '${registro.id}')"
                    title="Excluir registro"
                >
                    🗑️
                </button>

            </div>


            <div class="detalhes-registro">

                ${detalhes}

            </div>


            ${
                registro.observacoes
                    ? `
                    <div class="observacoes-registro">

                        <strong>📝 Observações</strong>

                        <p>
                            ${registro.observacoes}
                        </p>

                    </div>
                    `
                    : ""
            }


            <div class="rodape-registro">

                <span>
                    Lançado por:
                    <strong>
                        ${registro.lancadoPor || "-"}
                    </strong>
                </span>

            </div>

        </div>

    `;

}


// ======================================================
// FILTROS
// ======================================================

[
    "filtroData",
    "filtroRota",
    "filtroDriver",
    "filtroTipo"
].forEach((id) => {

    const elemento =
        document.getElementById(id);

    if (!elemento) return;


    elemento.addEventListener(
        "input",
        exibirRegistros
    );

    elemento.addEventListener(
        "change",
        exibirRegistros
    );

});


// ======================================================
// LIMPAR FILTROS
// ======================================================

window.limparFiltros = function () {

    const campos = [

        "filtroData",
        "filtroRota",
        "filtroDriver",
        "filtroTipo"

    ];


    campos.forEach((id) => {

        const campo =
            document.getElementById(id);

        if (campo) {

            campo.value = "";

        }

    });


    exibirRegistros();

};


// ======================================================
// EXCLUIR REGISTRO
// ======================================================

window.excluirRegistro = async function (
    fonte,
    id
) {

    if (!usuario) return;


    const confirmar =
        confirm(
            "Tem certeza que deseja excluir este registro?"
        );


    if (!confirmar) return;


    try {

        await remove(
            ref(
                db,
                `${fonte}/${id}`
            )
        );


        alert(
            "Registro excluído com sucesso!"
        );


        carregarDashboard();
        carregarRegistros();


    } catch (erro) {

        console.error(erro);

        alert(
            "Erro ao excluir registro."
        );

    }

};


// ======================================================
// ALTERAR SENHA
// ======================================================

window.abrirAlterarSenha = function () {

    const modal =
        document.getElementById("modalSenha");

    if (modal) {

        modal.classList.remove(
            "escondida"
        );

    }

};


window.fecharAlterarSenha = function () {

    const modal =
        document.getElementById("modalSenha");

    if (modal) {

        modal.classList.add(
            "escondida"
        );

    }

};


// ======================================================
// FORM ALTERAÇÃO DE SENHA
// ======================================================

document
    .getElementById("formAlterarSenha")
    ?.addEventListener("submit", async (e) => {

        e.preventDefault();


        if (!usuario) return;


        const senhaAtual =
            document
                .getElementById("senhaAtual")
                .value;


        const novaSenha =
            document
                .getElementById("novaSenha")
                .value;


        const confirmarSenha =
            document
                .getElementById("confirmarSenha")
                .value;


        const mensagem =
            document
                .getElementById("mensagemSenha");


        mensagem.textContent = "";


        if (novaSenha !== confirmarSenha) {

            mensagem.textContent =
                "As novas senhas não são iguais.";

            return;

        }


        if (novaSenha.length < 6) {

            mensagem.textContent =
                "A nova senha precisa ter pelo menos 6 caracteres.";

            return;

        }


        try {

            const credencial =
                EmailAuthProvider.credential(
                    usuario.email,
                    senhaAtual
                );


            await reauthenticateWithCredential(
                usuario,
                credencial
            );


            await updatePassword(
                usuario,
                novaSenha
            );


            mensagem.textContent =
                "Senha alterada com sucesso!";


            document
                .getElementById("formAlterarSenha")
                .reset();


            setTimeout(() => {

                fecharAlterarSenha();

            }, 1500);


        } catch (erro) {

            console.error(erro);


            if (
                erro.code ===
                "auth/wrong-password" ||
                erro.code ===
                "auth/invalid-credential"
            ) {

                mensagem.textContent =
                    "A senha atual está incorreta.";

            } else if (
                erro.code ===
                "auth/weak-password"
            ) {

                mensagem.textContent =
                    "A nova senha é muito fraca.";

            } else if (
                erro.code ===
                "auth/requires-recent-login"
            ) {

                mensagem.textContent =
                    "Faça login novamente e tente alterar a senha.";

            } else {

                mensagem.textContent =
                    "Não foi possível alterar a senha.";

            }

        }

    });


// ======================================================
// RECUPERAR SENHA
// ======================================================

window.abrirRecuperarSenha = function () {

    const modal =
        document.getElementById(
            "modalRecuperarSenha"
        );

    if (modal) {

        modal.classList.remove(
            "escondida"
        );

    }

};


window.fecharRecuperarSenha = function () {

    const modal =
        document.getElementById(
            "modalRecuperarSenha"
        );

    if (modal) {

        modal.classList.add(
            "escondida"
        );

    }

};


// ======================================================
// FORM RECUPERAÇÃO DE SENHA
// ======================================================

document
    .getElementById("formRecuperarSenha")
    ?.addEventListener("submit", async (e) => {

        e.preventDefault();


        const email =
            document
                .getElementById(
                    "emailRecuperacao"
                )
                .value
                .trim();


        const mensagem =
            document
                .getElementById(
                    "mensagemRecuperacao"
                );


        mensagem.textContent =
            "Enviando...";


        try {

            await sendPasswordResetEmail(
                auth,
                email
            );


            mensagem.textContent =
                "E-mail de recuperação enviado! Verifique também o spam.";


        } catch (erro) {

            console.error(erro);


            if (
                erro.code ===
                "auth/user-not-found"
            ) {

                mensagem.textContent =
                    "Não encontramos uma conta com esse e-mail.";

            } else {

                mensagem.textContent =
                    "Não foi possível enviar o e-mail.";

            }

        }

    });


// ======================================================
// FECHAR MODAIS CLICANDO FORA
// ======================================================

window.addEventListener(
    "click",
    (e) => {

        const modalSenha =
            document.getElementById(
                "modalSenha"
            );


        const modalRecuperacao =
            document.getElementById(
                "modalRecuperarSenha"
            );


        if (
            e.target === modalSenha
        ) {

            fecharAlterarSenha();

        }


        if (
            e.target === modalRecuperacao
        ) {

            fecharRecuperarSenha();

        }

    }
);


// ======================================================
// INICIALIZAÇÃO
// ======================================================

console.log(
    "Caxiense LOG carregado com sucesso."
);