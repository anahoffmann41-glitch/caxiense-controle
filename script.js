// ============================================================
// CAXIENSE LOG - CONTROLE OPERACIONAL
// script.js
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    sendPasswordResetEmail,
    updatePassword,
    reauthenticateWithCredential,
    EmailAuthProvider
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    push,
    set,
    get,
    remove
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";


// ============================================================
// FIREBASE
// ============================================================

const firebaseConfig = {
    apiKey: "AIzaSyCZ3xorH3D9Z0vmIfd_zafyceLJekXJPaY",
    authDomain: "amb-e-trans-caxiense-log.firebaseapp.com",
    databaseURL: "https://amb-e-trans-caxiense-log-default-rtdb.firebaseio.com",
    projectId: "amb-e-trans-caxiense-log",
    storageBucket: "amb-e-trans-caxiense-log.firebasestorage.app",
    messagingSenderId: "194048564958",
    appId: "1:194048564958:web:af334ffd5d248ec9d76c4f"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);


// ============================================================
// FUNÇÕES AUXILIARES
// ============================================================

function elemento(id) {
    return document.getElementById(id);
}


function mostrarElemento(id) {

    const el = elemento(id);

    if (!el) {
        console.warn("Elemento não encontrado:", id);
        return;
    }

    el.classList.remove("oculto");

    if (id === "telaLogin") {
        el.style.display = "flex";
    }

    if (id === "sistema") {
        el.style.display = "flex";
    }
}


function esconderElemento(id) {

    const el = elemento(id);

    if (!el) {
        console.warn("Elemento não encontrado:", id);
        return;
    }

    el.classList.add("oculto");
    el.style.display = "none";
}


function mostrarToast(mensagem, tipo = "sucesso") {

    const toast = elemento("toast");

    if (!toast) {
        console.log(mensagem);
        return;
    }

    toast.textContent = mensagem;

    toast.className = "toast";

    if (tipo === "erro") {
        toast.classList.add("erro");
    }

    if (tipo === "aviso") {
        toast.classList.add("aviso");
    }

    toast.classList.add("visivel");

    setTimeout(() => {
        toast.classList.remove("visivel");
    }, 3500);
}


// ============================================================
// NAVEGAÇÃO ENTRE PÁGINAS
// ============================================================

function mostrarPagina(paginaId) {

    console.log("Abrindo página:", paginaId);

    const paginas = document.querySelectorAll(".pagina");

    paginas.forEach((pagina) => {

        pagina.classList.remove("ativa");

        // Força esconder
        pagina.style.display = "none";
    });


    const pagina = elemento(paginaId);

    if (!pagina) {
        console.error("Página não encontrada:", paginaId);
        return;
    }


    // Mostra a página escolhida
    pagina.classList.add("ativa");

    pagina.style.display = "block";


    // ========================================================
    // TÍTULO
    // ========================================================

    const titulo = elemento("tituloPagina");

    const titulos = {
        paginaDashboard: "Dashboard",
        paginaAmbulancia: "Ambulâncias",
        paginaTransferencia: "Transferências",
        paginaApoio: "Apoio de Rota",
        paginaRegistros: "Registros"
    };


    if (titulo) {
        titulo.textContent = titulos[paginaId] || "Dashboard";
    }


    // ========================================================
    // MENU ATIVO
    // ========================================================

    document
        .querySelectorAll(".menu-item[data-pagina]")
        .forEach((menu) => {

            menu.classList.remove("ativo");

        });


    const menuAtivo = document.querySelector(
        `.menu-item[data-pagina="${paginaId}"]`
    );


    if (menuAtivo) {
        menuAtivo.classList.add("ativo");
    }


    // ========================================================
    // FECHA MENU MOBILE
    // ========================================================

    const sidebar = document.querySelector(".sidebar");

    if (sidebar) {
        sidebar.classList.remove("aberta");
    }


    // ========================================================
    // REGISTROS
    // ========================================================

    if (paginaId === "paginaRegistros") {

        renderizarRegistros();

    }
}


function configurarNavegacao() {

    const menus = document.querySelectorAll(
        ".menu-item[data-pagina]"
    );


    console.log(
        "Menus encontrados:",
        menus.length
    );


    menus.forEach((item) => {

        item.addEventListener("click", function (event) {

            event.preventDefault();

            const paginaId =
                item.getAttribute("data-pagina");

            console.log(
                "Clique no menu:",
                paginaId
            );

            mostrarPagina(paginaId);

        });

    });


    // Dashboard inicial
    mostrarPagina("paginaDashboard");
}


// ============================================================
// MENU MOBILE
// ============================================================

window.alternarSidebar = function () {

    const sidebar = document.querySelector(".sidebar");

    if (!sidebar) {
        console.warn("Sidebar não encontrada.");
        return;
    }

    sidebar.classList.toggle("aberta");
};


// ============================================================
// LOGIN
// ============================================================

function configurarLogin() {

    const formLogin = elemento("formLogin");

    if (!formLogin) {
        console.warn("Formulário de login não encontrado.");
        return;
    }


    formLogin.addEventListener("submit", async function (event) {

        event.preventDefault();


        const email =
            elemento("loginEmail")?.value.trim();

        const senha =
            elemento("loginSenha")?.value;


        const mensagem =
            elemento("mensagemLogin");


        if (!email || !senha) {

            if (mensagem) {
                mensagem.textContent =
                    "Informe o e-mail e a senha.";
            }

            return;
        }


        try {

            if (mensagem) {
                mensagem.textContent =
                    "Entrando...";
            }


            await signInWithEmailAndPassword(
                auth,
                email,
                senha
            );


            if (mensagem) {
                mensagem.textContent = "";
            }


        } catch (erro) {

            console.error(
                "Erro no login:",
                erro
            );


            let texto =
                "Não foi possível entrar.";


            if (
                erro.code ===
                "auth/invalid-credential"
            ) {
                texto =
                    "E-mail ou senha incorretos.";
            }


            if (
                erro.code ===
                "auth/invalid-email"
            ) {
                texto =
                    "Digite um e-mail válido.";
            }


            if (mensagem) {
                mensagem.textContent = texto;
            }

        }

    });


    console.log("Login configurado.");
}


// ============================================================
// RECUPERAÇÃO DE SENHA
// ============================================================

function configurarRecuperacao() {

    const btn =
        elemento("btnEsqueciSenha");

    const modal =
        elemento("modalRecuperacao");

    const fechar =
        elemento("fecharModalRecuperacao");

    const cancelar =
        elemento("cancelarRecuperacao");

    const form =
        elemento("formRecuperacao");


    console.log(
        "Configurando recuperação de senha..."
    );


    if (btn) {

        btn.addEventListener(
            "click",
            function () {

                console.log(
                    "Botão 'Esqueci minha senha' clicado."
                );


                if (modal) {

                    modal.classList.remove("oculto");

                    modal.style.display = "flex";

                    console.log(
                        "Modal de recuperação aberto."
                    );
                }

            }
        );

    }


    function fecharModal() {

        if (!modal) return;

        modal.classList.add("oculto");

        modal.style.display = "none";

    }


    if (fechar) {
        fechar.addEventListener(
            "click",
            fecharModal
        );
    }


    if (cancelar) {
        cancelar.addEventListener(
            "click",
            fecharModal
        );
    }


    if (form) {

        form.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const email =
                    elemento("emailRecuperacao")
                        ?.value
                        .trim();


                if (!email) {

                    mostrarToast(
                        "Digite seu e-mail.",
                        "erro"
                    );

                    return;
                }


                try {

                    await sendPasswordResetEmail(
                        auth,
                        email
                    );


                    mostrarToast(
                        "E-mail de recuperação enviado."
                    );


                    fecharModal();


                } catch (erro) {

                    console.error(
                        erro
                    );


                    mostrarToast(
                        "Não foi possível enviar o e-mail.",
                        "erro"
                    );

                }

            }
        );

    }


    console.log(
        "Recuperação de senha configurada."
    );
}


// ============================================================
// LOGOUT
// ============================================================

function configurarLogout() {

    const botoesLogout =
        document.querySelectorAll(
            "[data-logout], #btnSair, #btnLogout"
        );


    botoesLogout.forEach((botao) => {

        botao.addEventListener(
            "click",
            async function () {

                try {

                    await signOut(auth);

                } catch (erro) {

                    console.error(
                        "Erro ao sair:",
                        erro
                    );

                }

            }
        );

    });

}


// ============================================================
// AUTENTICAÇÃO
// ============================================================

function configurarAutenticacao() {

    onAuthStateChanged(
        auth,
        async function (user) {

            console.log(
                "Estado de autenticação:",
                user
                    ? user.email
                    : "nenhum usuário"
            );


            if (user) {

                // Esconde login
                esconderElemento(
                    "telaLogin"
                );


                // Mostra sistema
                mostrarElemento(
                    "sistema"
                );


                const usuarioEmail =
                    elemento("usuarioEmail");


                if (usuarioEmail) {

                    usuarioEmail.textContent =
                        user.email ||
                        "Usuário";

                }


                // Garante dashboard
                mostrarPagina(
                    "paginaDashboard"
                );


                // Carrega dados
                await carregarDados();


                // Atualiza dashboard
                atualizarDashboard();


            } else {

                // Mostra login
                mostrarElemento(
                    "telaLogin"
                );


                // Esconde sistema
                esconderElemento(
                    "sistema"
                );


                const usuarioEmail =
                    elemento("usuarioEmail");


                if (usuarioEmail) {

                    usuarioEmail.textContent =
                        "-";

                }

            }

        }
    );

}


// ============================================================
// DADOS
// ============================================================

let dadosAmbulancias = [];

let dadosTransferencias = [];

let dadosApoios = [];


// ============================================================
// CARREGAR DADOS
// ============================================================

async function carregarDados() {

    console.log(
        "Carregando dados do Firebase..."
    );


    try {

        const ambulanciasSnap =
            await get(
                ref(db, "ambulancias")
            );


        const transferenciasSnap =
            await get(
                ref(db, "transferencias")
            );


        const apoiosSnap =
            await get(
                ref(db, "apoios")
            );


        dadosAmbulancias =
            ambulanciasSnap.exists()
                ? Object.entries(
                    ambulanciasSnap.val()
                ).map(([id, valor]) => ({
                    id,
                    ...valor,
                    tipo: "Ambulância"
                }))
                : [];


        dadosTransferencias =
            transferenciasSnap.exists()
                ? Object.entries(
                    transferenciasSnap.val()
                ).map(([id, valor]) => ({
                    id,
                    ...valor,
                    tipo: "Transferência"
                }))
                : [];


        dadosApoios =
            apoiosSnap.exists()
                ? Object.entries(
                    apoiosSnap.val()
                ).map(([id, valor]) => ({
                    id,
                    ...valor,
                    tipo: "Apoio de Rota"
                }))
                : [];


        console.log(
            "Dados carregados:",
            {
                ambulancias:
                    dadosAmbulancias.length,

                transferencias:
                    dadosTransferencias.length,

                apoios:
                    dadosApoios.length
            }
        );


    } catch (erro) {

        console.error(
            "Erro ao carregar dados:",
            erro
        );

        mostrarToast(
            "Erro ao carregar os dados.",
            "erro"
        );

    }

}


// ============================================================
// FORMULÁRIO - AMBULÂNCIA
// ============================================================

function configurarFormularioAmbulancia() {

    const form =
        elemento("formAmbulancia");


    if (!form) return;


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                auth.currentUser;


            if (!user) {

                mostrarToast(
                    "Usuário não autenticado.",
                    "erro"
                );

                return;

            }


            const dados = {

                data:
                    elemento("ambulanciaData")?.value ||
                    "",

                routeId:
                    elemento("ambulanciaRouteId")?.value.trim() ||
                    "",

                motorista:
                    elemento("ambulanciaMotorista")?.value.trim() ||
                    "",

                cidade:
                    elemento("ambulanciaCidade")?.value.trim() ||
                    "",

                pacotes:
                    Number(
                        elemento("ambulanciaPacotes")?.value ||
                        0
                    ),

                motivo:
                    elemento("ambulanciaMotivo")?.value.trim() ||
                    "",

                observacoes:
                    elemento("ambulanciaObservacoes")?.value.trim() ||
                    "",

                autorizadoPor:
                    elemento("ambulanciaAutorizadoPor")?.value.trim() ||
                    "",

                lancadoPor:
                    user.email,

                criadoEm:
                    new Date().toISOString()

            };


            try {

                await push(
                    ref(db, "ambulancias"),
                    dados
                );


                mostrarToast(
                    "Ambulância registrada com sucesso."
                );


                form.reset();


                await carregarDados();

                atualizarDashboard();


            } catch (erro) {

                console.error(
                    erro
                );


                mostrarToast(
                    "Erro ao salvar ambulância.",
                    "erro"
                );

            }

        }
    );

}


// ============================================================
// FORMULÁRIO - TRANSFERÊNCIA
// ============================================================

function configurarFormularioTransferencia() {

    const form =
        elemento("formTransferencia");


    if (!form) return;


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                auth.currentUser;


            if (!user) {

                mostrarToast(
                    "Usuário não autenticado.",
                    "erro"
                );

                return;

            }


            const dados = {

                data:
                    elemento("transferenciaData")?.value ||
                    "",

                routeId:
                    elemento("transferenciaRouteId")?.value.trim() ||
                    "",

                motoristaInicio:
                    elemento("transferenciaMotoristaInicio")?.value.trim() ||
                    "",

                motoristaSubstituto:
                    elemento("transferenciaMotoristaSubstituto")?.value.trim() ||
                    "",

                cidade:
                    elemento("transferenciaCidade")?.value.trim() ||
                    "",

                motivo:
                    elemento("transferenciaMotivo")?.value.trim() ||
                    "",

                observacoes:
                    elemento("transferenciaObservacoes")?.value.trim() ||
                    "",

                autorizadoPor:
                    elemento("transferenciaAutorizadoPor")?.value.trim() ||
                    "",

                lancadoPor:
                    user.email,

                criadoEm:
                    new Date().toISOString()

            };


            try {

                await push(
                    ref(db, "transferencias"),
                    dados
                );


                mostrarToast(
                    "Transferência registrada com sucesso."
                );


                form.reset();


                await carregarDados();

                atualizarDashboard();


            } catch (erro) {

                console.error(
                    erro
                );


                mostrarToast(
                    "Erro ao salvar transferência.",
                    "erro"
                );

            }

        }
    );

}


// ============================================================
// FORMULÁRIO - APOIO
// ============================================================

function configurarFormularioApoio() {

    const form =
        elemento("formApoio");


    if (!form) return;


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                auth.currentUser;


            if (!user) {

                mostrarToast(
                    "Usuário não autenticado.",
                    "erro"
                );

                return;

            }


            const dados = {

                data:
                    elemento("apoioData")?.value ||
                    "",

                routeId:
                    elemento("apoioRouteId")?.value.trim() ||
                    "",

                valor:
                    Number(
                        elemento("apoioValor")?.value ||
                        0
                    ),

                motoristaApoio:
                    elemento("apoioMotoristaApoio")?.value.trim() ||
                    "",

                motoristaAjudado:
                    elemento("apoioMotoristaAjudado")?.value.trim() ||
                    "",

                autorizadoPor:
                    elemento("apoioAutorizadoPor")?.value.trim() ||
                    "",

                observacoes:
                    elemento("apoioObservacoes")?.value.trim() ||
                    "",

                lancadoPor:
                    user.email,

                criadoEm:
                    new Date().toISOString()

            };


            try {

                await push(
                    ref(db, "apoios"),
                    dados
                );


                mostrarToast(
                    "Apoio registrado com sucesso."
                );


                form.reset();


                await carregarDados();

                atualizarDashboard();


            } catch (erro) {

                console.error(
                    erro
                );


                mostrarToast(
                    "Erro ao salvar apoio.",
                    "erro"
                );

            }

        }
    );

}


// ============================================================
// DASHBOARD
// ============================================================

function atualizarDashboard() {

    const totalAmbulancias =
        dadosAmbulancias.length;


    const totalTransferencias =
        dadosTransferencias.length;


    const totalApoios =
        dadosApoios.length;


    const totalGeral =
        totalAmbulancias +
        totalTransferencias +
        totalApoios;


    function colocarTexto(
        possiveisIds,
        valor
    ) {

        for (const id of possiveisIds) {

            const el =
                elemento(id);

            if (el) {

                el.textContent =
                    valor;

                return;

            }

        }

    }


    colocarTexto(
        [
            "totalAmbulancias",
            "totalAmbulancia"
        ],
        totalAmbulancias
    );


    colocarTexto(
        [
            "totalTransferencias",
            "totalTransferencia"
        ],
        totalTransferencias
    );


    colocarTexto(
        [
            "totalApoios",
            "totalApoio"
        ],
        totalApoios
    );


    colocarTexto(
        [
            "totalGeral"
        ],
        totalGeral
    );


    console.log(
        "Dashboard atualizado."
    );

}


// ============================================================
// REGISTROS
// ============================================================

function obterTodosRegistros() {

    return [
        ...dadosAmbulancias,
        ...dadosTransferencias,
        ...dadosApoios
    ].sort(
        (a, b) =>
            new Date(
                b.criadoEm || 0
            ) -
            new Date(
                a.criadoEm || 0
            )
    );

}


function renderizarRegistros() {

    const container =
        elemento("listaRegistros");


    if (!container) {

        console.warn(
            "listaRegistros não encontrada."
        );

        return;

    }


    const registros =
        obterTodosRegistros();


    if (registros.length === 0) {

        container.innerHTML = `
            <div class="estado-vazio">
                Nenhum registro encontrado.
            </div>
        `;

        return;

    }


    container.innerHTML =
        registros.map(
            (registro) => `

                <div class="registro-card">

                    <div class="registro-topo">

                        <strong>
                            ${registro.tipo || "-"}
                        </strong>

                        <span>
                            ${registro.data || "-"}
                        </span>

                    </div>


                    <div class="registro-info">

                        <p>
                            <strong>Rota:</strong>
                            ${registro.routeId || "-"}
                        </p>

                        <p>
                            <strong>Motorista:</strong>
                            ${
                                registro.motorista ||
                                registro.motoristaInicio ||
                                registro.motoristaApoio ||
                                "-"
                            }
                        </p>

                        <p>
                            <strong>Cidade:</strong>
                            ${registro.cidade || "-"}
                        </p>

                        <p>
                            <strong>Motivo:</strong>
                            ${registro.motivo || "-"}
                        </p>

                    </div>

                    <button
                        type="button"
                        class="btn-excluir-registro"
                        data-id="${registro.id}"
                        data-tipo="${registro.tipo}"
                    >
                        Excluir
                    </button>

                </div>

            `
        ).join("");


    container
        .querySelectorAll(
            ".btn-excluir-registro"
        )
        .forEach(
            (botao) => {

                botao.addEventListener(
                    "click",
                    async function () {

                        const id =
                            botao.dataset.id;

                        const tipo =
                            botao.dataset.tipo;


                        let caminho = "";


                        if (
                            tipo ===
                            "Ambulância"
                        ) {
                            caminho =
                                "ambulancias";
                        }


                        if (
                            tipo ===
                            "Transferência"
                        ) {
                            caminho =
                                "transferencias";
                        }


                        if (
                            tipo ===
                            "Apoio de Rota"
                        ) {
                            caminho =
                                "apoios";
                        }


                        if (!caminho) return;


                        const confirmar =
                            confirm(
                                "Deseja excluir este registro?"
                            );


                        if (!confirmar) return;


                        try {

                            await remove(
                                ref(
                                    db,
                                    `${caminho}/${id}`
                                )
                            );


                            mostrarToast(
                                "Registro excluído."
                            );


                            await carregarDados();

                            atualizarDashboard();

                            renderizarRegistros();


                        } catch (erro) {

                            console.error(
                                erro
                            );


                            mostrarToast(
                                "Erro ao excluir registro.",
                                "erro"
                            );

                        }

                    }
                );

            }
        );

}


// ============================================================
// ALTERAR SENHA
// ============================================================

function configurarAlteracaoSenha() {

    const form =
        elemento("formAlterarSenha");


    if (!form) return;


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                auth.currentUser;


            if (!user) return;


            const senhaAtual =
                elemento("senhaAtual")?.value;


            const novaSenha =
                elemento("novaSenha")?.value;


            const confirmarSenha =
                elemento("confirmarNovaSenha")?.value;


            if (
                !senhaAtual ||
                !novaSenha ||
                !confirmarSenha
            ) {

                mostrarToast(
                    "Preencha todos os campos.",
                    "erro"
                );

                return;

            }


            if (novaSenha !== confirmarSenha) {

                mostrarToast(
                    "As senhas não são iguais.",
                    "erro"
                );

                return;

            }


            try {

                const credencial =
                    EmailAuthProvider.credential(
                        user.email,
                        senhaAtual
                    );


                await reauthenticateWithCredential(
                    user,
                    credencial
                );


                await updatePassword(
                    user,
                    novaSenha
                );


                mostrarToast(
                    "Senha alterada com sucesso."
                );


                form.reset();


            } catch (erro) {

                console.error(
                    erro
                );


                mostrarToast(
                    "Não foi possível alterar a senha.",
                    "erro"
                );

            }

        }
    );

}


// ============================================================
// MODAIS
// ============================================================

function configurarModais() {

    document
        .querySelectorAll(
            "[data-fechar-modal]"
        )
        .forEach(
            (botao) => {

                botao.addEventListener(
                    "click",
                    function () {

                        const modalId =
                            botao.getAttribute(
                                "data-fechar-modal"
                            );


                        const modal =
                            elemento(modalId);


                        if (!modal) return;


                        modal.classList.add(
                            "oculto"
                        );


                        modal.style.display =
                            "none";

                    }
                );

            }
        );

}


// ============================================================
// INICIALIZAÇÃO
// ============================================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "Iniciando Caxiense Controle Operacional..."
        );


        configurarLogin();

        configurarRecuperacao();

        configurarLogout();

        configurarNavegacao();

        configurarFormularioAmbulancia();

        configurarFormularioTransferencia();

        configurarFormularioApoio();

        configurarAlteracaoSenha();

        configurarModais();

        configurarAutenticacao();


        console.log(
            "Caxiense Controle Operacional carregado com sucesso."
        );

    }
);
