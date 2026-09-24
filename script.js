import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword,
    sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getDatabase,
    ref,
    push,
    set,
    get,
    remove
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";


// ======================================================
// FIREBASE
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

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getDatabase(app);


// ======================================================
// VARIÁVEIS
// ======================================================

let todosRegistros = [];


// ======================================================
// FUNÇÕES AUXILIARES
// ======================================================

function elemento(id) {
    return document.getElementById(id);
}


function mostrarElemento(id) {

    const el = elemento(id);

    if (el) {

        el.classList.remove("oculto");

        el.style.display = "";
    }
}


function esconderElemento(id) {

    const el = elemento(id);

    if (el) {

        el.classList.add("oculto");

        el.style.display = "none";
    }
}


function hoje() {

    const data = new Date();

    const ano = data.getFullYear();

    const mes = String(
        data.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        data.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


function formatarData(data) {

    if (!data) {
        return "-";
    }

    const partes =
        String(data).split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function formatarMoeda(valor) {

    const numero =
        Number(valor) || 0;

    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


function mostrarToast(
    mensagem,
    tipo = "normal"
) {

    const toast =
        elemento("toast");

    if (!toast) {
        return;
    }

    toast.textContent =
        mensagem;

    toast.className =
        "toast";

    toast.classList.add(
        "visivel"
    );

    if (tipo === "erro") {

        toast.classList.add(
            "erro"
        );
    }

    if (tipo === "sucesso") {

        toast.classList.add(
            "sucesso"
        );
    }

    setTimeout(
        function () {

            toast.classList.remove(
                "visivel"
            );

        },
        3500
    );
}


// ======================================================
// LOGIN
// ======================================================

function configurarLogin() {

    const formLogin =
        elemento("formLogin");

    if (!formLogin) {

        console.warn(
            "formLogin não encontrado."
        );

        return;
    }

    formLogin.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const emailInput =
                elemento("loginEmail");

            const senhaInput =
                elemento("loginSenha");

            const mensagem =
                elemento("mensagemLogin");

            const botao =
                formLogin.querySelector(
                    'button[type="submit"]'
                );

            const email =
                emailInput
                    ? emailInput.value.trim()
                    : "";

            const senha =
                senhaInput
                    ? senhaInput.value
                    : "";

            if (!email || !senha) {

                if (mensagem) {

                    mensagem.textContent =
                        "Digite seu e-mail e sua senha.";

                    mensagem.className =
                        "mensagem erro";
                }

                return;
            }

            if (botao) {

                botao.disabled = true;

                botao.textContent =
                    "Entrando...";
            }

            if (mensagem) {

                mensagem.textContent =
                    "";

                mensagem.className =
                    "mensagem";
            }

            try {

                console.log(
                    "Tentando fazer login:",
                    email
                );

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    senha
                );

                console.log(
                    "Login realizado com sucesso."
                );

                if (mensagem) {

                    mensagem.textContent =
                        "Login realizado com sucesso!";

                    mensagem.className =
                        "mensagem sucesso";
                }

            } catch (error) {

                console.error(
                    "Erro no login:",
                    error
                );

                let mensagemErro =
                    "Não foi possível entrar.";

                switch (error.code) {

                    case "auth/invalid-credential":

                        mensagemErro =
                            "E-mail ou senha incorretos.";

                        break;

                    case "auth/invalid-email":

                        mensagemErro =
                            "E-mail inválido.";

                        break;

                    case "auth/user-not-found":

                        mensagemErro =
                            "Usuário não encontrado.";

                        break;

                    case "auth/wrong-password":

                        mensagemErro =
                            "Senha incorreta.";

                        break;

                    case "auth/user-disabled":

                        mensagemErro =
                            "Este usuário está desativado.";

                        break;

                    case "auth/too-many-requests":

                        mensagemErro =
                            "Muitas tentativas. Aguarde alguns minutos e tente novamente.";

                        break;

                    case "auth/network-request-failed":

                        mensagemErro =
                            "Erro de conexão. Verifique sua internet.";

                        break;

                    default:

                        mensagemErro =
                            `Erro ao entrar: ${error.message}`;

                        break;
                }

                if (mensagem) {

                    mensagem.textContent =
                        mensagemErro;

                    mensagem.className =
                        "mensagem erro";
                }

            } finally {

                if (botao) {

                    botao.disabled = false;

                    botao.textContent =
                        "Entrar";
                }
            }
        }
    );

    console.log(
        "Login configurado."
    );
}


// ======================================================
// RECUPERAR SENHA
// ======================================================

function abrirModalRecuperacao() {

    console.log(
        "Botão 'Esqueci minha senha' clicado."
    );

    const modal =
        elemento(
            "modalRecuperarSenha"
        );

    const emailLogin =
        elemento("loginEmail");

    const emailRecuperacao =
        elemento(
            "emailRecuperacao"
        );

    if (!modal) {

        console.error(
            "Modal de recuperação não encontrado."
        );

        return;
    }

    if (
        emailLogin &&
        emailRecuperacao &&
        emailLogin.value.trim()
    ) {

        emailRecuperacao.value =
            emailLogin.value.trim();
    }

    modal.classList.remove(
        "oculto"
    );

    modal.style.display =
        "flex";

    modal.style.visibility =
        "visible";

    modal.style.opacity =
        "1";

    console.log(
        "Modal de recuperação aberto."
    );
}


function fecharModalRecuperacao() {

    const modal =
        elemento(
            "modalRecuperarSenha"
        );

    if (!modal) {
        return;
    }

    modal.classList.add(
        "oculto"
    );

    modal.style.display =
        "";

    modal.style.visibility =
        "";

    modal.style.opacity =
        "";
}


function configurarRecuperacaoSenha() {

    console.log(
        "Configurando recuperação de senha..."
    );

    const btnEsqueciSenha =
        elemento(
            "btnEsqueciSenha"
        );

    const form =
        elemento(
            "formRecuperarSenha"
        );

    if (!btnEsqueciSenha) {

        console.error(
            "ERRO: botão btnEsqueciSenha não encontrado."
        );

    } else {

        btnEsqueciSenha.onclick =
            function (event) {

                if (event) {

                    event.preventDefault();

                    event.stopPropagation();
                }

                abrirModalRecuperacao();
            };

        console.log(
            "Botão de recuperação configurado."
        );
    }


    if (!form) {

        console.error(
            "ERRO: formRecuperarSenha não encontrado."
        );

        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            console.log(
                "Formulário de recuperação enviado."
            );

            const emailRecuperacao =
                elemento(
                    "emailRecuperacao"
                );

            const mensagem =
                elemento(
                    "mensagemRecuperarSenha"
                );

            const email =
                emailRecuperacao
                    ? emailRecuperacao.value.trim()
                    : "";


            if (!email) {

                if (mensagem) {

                    mensagem.textContent =
                        "Digite seu e-mail.";

                    mensagem.className =
                        "mensagem erro";
                }

                return;
            }


            try {

                console.log(
                    "Enviando recuperação para:",
                    email
                );

                await sendPasswordResetEmail(
                    auth,
                    email
                );

                console.log(
                    "E-mail de recuperação enviado."
                );

                if (mensagem) {

                    mensagem.textContent =
                        "E-mail de recuperação enviado. Verifique também a caixa de spam.";

                    mensagem.className =
                        "mensagem sucesso";
                }

            } catch (error) {

                console.error(
                    "Erro na recuperação:",
                    error
                );

                let mensagemErro =
                    "Não foi possível enviar o e-mail de recuperação.";

                switch (error.code) {

                    case "auth/invalid-email":

                        mensagemErro =
                            "Digite um e-mail válido.";

                        break;

                    case "auth/user-not-found":

                        mensagemErro =
                            "Não encontramos um usuário com este e-mail.";

                        break;

                    case "auth/too-many-requests":

                        mensagemErro =
                            "Muitas tentativas. Aguarde alguns minutos e tente novamente.";

                        break;

                    case "auth/network-request-failed":

                        mensagemErro =
                            "Erro de conexão. Verifique sua internet.";

                        break;

                    default:

                        mensagemErro =
                            `Erro: ${error.message}`;

                        break;
                }

                if (mensagem) {

                    mensagem.textContent =
                        mensagemErro;

                    mensagem.className =
                        "mensagem erro";
                }
            }
        }
    );

    console.log(
        "Formulário de recuperação configurado."
    );
}


// ======================================================
// MOSTRAR SISTEMA
// ======================================================

function mostrarSistema() {

    const telaLogin =
        elemento("telaLogin");

    const sistema =
        elemento("sistema");


    if (telaLogin) {

        telaLogin.classList.add(
            "oculto"
        );

        telaLogin.style.display =
            "none";
    }


    if (sistema) {

        sistema.classList.remove(
            "oculto"
        );

        sistema.style.display =
            "block";

        sistema.style.visibility =
            "visible";

        sistema.style.opacity =
            "1";

        sistema.style.position =
            "relative";

        sistema.style.top =
            "0";

        sistema.style.left =
            "0";

        sistema.style.width =
            "100%";

        sistema.style.minHeight =
            "100vh";

        sistema.style.zIndex =
            "1";
    }

    console.log(
        "Sistema exibido."
    );
}


function mostrarLogin() {

    const telaLogin =
        elemento("telaLogin");

    const sistema =
        elemento("sistema");


    if (telaLogin) {

        telaLogin.classList.remove(
            "oculto"
        );

        telaLogin.style.display =
            "flex";

        telaLogin.style.visibility =
            "visible";

        telaLogin.style.opacity =
            "1";
    }


    if (sistema) {

        sistema.classList.add(
            "oculto"
        );

        sistema.style.display =
            "none";
    }


    console.log(
        "Tela de login exibida."
    );
}


// ======================================================
// OBSERVADOR DE LOGIN
// ======================================================

onAuthStateChanged(
    auth,
    async function (user) {

        console.log(
            "Estado de autenticação:",
            user
                ? user.email
                : "desconectado"
        );


        if (user) {

            mostrarSistema();


            const usuarioEmail =
                elemento(
                    "usuarioEmail"
                );

            if (usuarioEmail) {

                usuarioEmail.textContent =
                    user.email ||
                    "Usuário";
            }


            // Sempre começa no Dashboard
            abrirPagina(
                "paginaDashboard"
            );


            try {

                await carregarDados();

            } catch (error) {

                console.error(
                    "Erro ao carregar dados:",
                    error
                );
            }

        } else {

            mostrarLogin();


            const usuarioEmail =
                elemento(
                    "usuarioEmail"
                );

            if (usuarioEmail) {

                usuarioEmail.textContent =
                    "-";
            }
        }
    }
);


// ======================================================
// LOGOUT
// ======================================================

function configurarLogout() {

    const btnSair =
        elemento("btnSair");

    if (!btnSair) {

        console.warn(
            "btnSair não encontrado."
        );

        return;
    }


    btnSair.addEventListener(
        "click",
        async function () {

            console.log(
                "Solicitação de logout."
            );

            try {

                await signOut(auth);

                console.log(
                    "Logout realizado."
                );

            } catch (error) {

                console.error(
                    "Erro ao sair:",
                    error
                );

                mostrarToast(
                    "Não foi possível sair.",
                    "erro"
                );
            }
        }
    );
}


// ======================================================
// SIDEBAR MOBILE
// ======================================================

window.alternarSidebar =
    function () {

        const sidebar =
            document.querySelector(
                ".sidebar"
            );

        if (!sidebar) {
            return;
        }

        sidebar.classList.toggle(
            "aberta"
        );
    };


function configurarSidebar() {

    document.addEventListener(
        "click",
        function (event) {

            const sidebar =
                document.querySelector(
                    ".sidebar"
                );

            const botao =
                elemento(
                    "btnMenuMobile"
                );

            if (!sidebar || !botao) {
                return;
            }


            if (
                window.innerWidth <= 900 &&
                sidebar.classList.contains(
                    "aberta"
                ) &&
                !sidebar.contains(
                    event.target
                ) &&
                !botao.contains(
                    event.target
                )
            ) {

                sidebar.classList.remove(
                    "aberta"
                );
            }
        }
    );
}


// ======================================================
// NAVEGAÇÃO
// ======================================================

function abrirPagina(
    paginaId
) {

    console.log(
        "Abrindo página:",
        paginaId
    );


    const paginas =
        document.querySelectorAll(
            ".pagina"
        );


    paginas.forEach(
        function (pagina) {

            pagina.classList.remove(
                "ativa"
            );

            // CORREÇÃO PRINCIPAL:
            // esconde diretamente pelo JavaScript
            pagina.style.display =
                "none";
        }
    );


    const pagina =
        elemento(
            paginaId
        );


    if (!pagina) {

        console.error(
            "Página não encontrada:",
            paginaId
        );

        return;
    }


    pagina.classList.add(
        "ativa"
    );

    // Mostra diretamente
    pagina.style.display =
        "block";


    const menuItens =
        document.querySelectorAll(
            ".menu-item[data-pagina]"
        );


    menuItens.forEach(
        function (menu) {

            menu.classList.remove(
                "ativo"
            );
        }
    );


    const menuAtivo =
        document.querySelector(
            `.menu-item[data-pagina="${paginaId}"]`
        );


    if (menuAtivo) {

        menuAtivo.classList.add(
            "ativo"
        );
    }


    const titulos = {

        paginaDashboard:
            "Dashboard",

        paginaAmbulancia:
            "Ambulâncias",

        paginaTransferencia:
            "Transferências",

        paginaApoio:
            "Apoio de Rota",

        paginaRegistros:
            "Registros"
    };


    const titulo =
        elemento(
            "tituloPagina"
        );


    if (titulo) {

        titulo.textContent =
            titulos[paginaId] ||
            "Dashboard";
    }


    if (
        paginaId ===
        "paginaRegistros"
    ) {

        renderizarRegistros();
    }


    const sidebar =
        document.querySelector(
            ".sidebar"
        );


    if (
        sidebar &&
        window.innerWidth <= 900
    ) {

        sidebar.classList.remove(
            "aberta"
        );
    }


    console.log(
        "Página aberta com sucesso:",
        paginaId
    );
}


function configurarNavegacao() {

    const menuItens =
        document.querySelectorAll(
            ".menu-item[data-pagina]"
        );


    console.log(
        "Itens de menu encontrados:",
        menuItens.length
    );


    menuItens.forEach(
        function (item) {

            item.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();


                    const paginaId =
                        item.getAttribute(
                            "data-pagina"
                        );


                    console.log(
                        "Menu clicado:",
                        paginaId
                    );


                    if (!paginaId) {
                        return;
                    }


                    abrirPagina(
                        paginaId
                    );
                }
            );
        }
    );


    // Garante Dashboard inicial
    abrirPagina(
        "paginaDashboard"
    );
}


// ======================================================
// CARREGAR DADOS
// ======================================================

async function carregarDados() {

    try {

        console.log(
            "Carregando dados do Firebase..."
        );


        const caminhos = [

            {
                caminho:
                    "ambulancias",

                tipo:
                    "ambulancia"
            },

            {
                caminho:
                    "transferencias",

                tipo:
                    "transferencia"
            },

            {
                caminho:
                    "apoios",

                tipo:
                    "apoio"
            }
        ];


        let registros = [];


        for (
            const item
            of caminhos
        ) {

            const referencia =
                ref(
                    db,
                    item.caminho
                );


            const snapshot =
                await get(
                    referencia
                );


            if (!snapshot.exists()) {

                continue;
            }


            const dados =
                snapshot.val();


            Object.keys(dados)
                .forEach(
                    function (id) {

                        registros.push({

                            id:
                                id,

                            tipo:
                                item.tipo,

                            ...dados[id]
                        });
                    }
                );
        }


        registros.sort(
            function (a, b) {

                const dataA =
                    `${a.data || ""} ${a.hora || ""}`;

                const dataB =
                    `${b.data || ""} ${b.hora || ""}`;

                return dataB.localeCompare(
                    dataA
                );
            }
        );


        todosRegistros =
            registros;


        console.log(
            "Dados carregados:",
            todosRegistros
        );


        atualizarDashboard();

        renderizarRegistros();

    } catch (error) {

        console.error(
            "Erro ao carregar dados:",
            error
        );

        mostrarToast(
            "Não foi possível carregar os dados.",
            "erro"
        );
    }
}


// ======================================================
// AMBULÂNCIA
// ======================================================

function configurarFormularioAmbulancia() {

    const form =
        elemento(
            "formAmbulancia"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                auth.currentUser;


            if (!user) {

                mostrarToast(
                    "Faça login novamente.",
                    "erro"
                );

                return;
            }


            const dados = {

                data:
                    elemento(
                        "ambulanciaData"
                    ).value,

                rota:
                    elemento(
                        "ambulanciaRota"
                    ).value.trim(),

                driver:
                    elemento(
                        "ambulanciaDriver"
                    ).value.trim(),

                cidade:
                    elemento(
                        "ambulanciaCidade"
                    ).value.trim(),

                pacotes:
                    Number(
                        elemento(
                            "ambulanciaPacotes"
                        ).value
                    ) || 0,

                motivo:
                    elemento(
                        "ambulanciaMotivo"
                    ).value.trim(),

                meli:
                    elemento(
                        "ambulanciaMeli"
                    ).value.trim(),

                observacoes:
                    elemento(
                        "ambulanciaObservacoes"
                    ).value.trim(),

                lancadoPor:
                    user.email,

                criadoEm:
                    Date.now(),

                hora:
                    new Date()
                        .toLocaleTimeString(
                            "pt-BR",
                            {
                                hour:
                                    "2-digit",

                                minute:
                                    "2-digit"
                            }
                        )
            };


            try {

                const novaReferencia =
                    push(
                        ref(
                            db,
                            "ambulancias"
                        )
                    );


                await set(
                    novaReferencia,
                    dados
                );


                mostrarToast(
                    "Ambulância lançada com sucesso!",
                    "sucesso"
                );


                form.reset();


                elemento(
                    "ambulanciaData"
                ).value =
                    hoje();


                await carregarDados();

            } catch (error) {

                console.error(
                    "Erro ao salvar ambulância:",
                    error
                );


                mostrarToast(
                    "Erro ao salvar ambulância.",
                    "erro"
                );
            }
        }
    );
}


// ======================================================
// TRANSFERÊNCIA
// ======================================================

function configurarFormularioTransferencia() {

    const form =
        elemento(
            "formTransferencia"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                auth.currentUser;


            if (!user) {

                mostrarToast(
                    "Faça login novamente.",
                    "erro"
                );

                return;
            }


            const dados = {

                data:
                    elemento(
                        "transferenciaData"
                    ).value,

                rota:
                    elemento(
                        "transferenciaRota"
                    ).value.trim(),

                driverInicial:
                    elemento(
                        "transferenciaDriverInicial"
                    ).value.trim(),

                driverSubstituto:
                    elemento(
                        "transferenciaDriverSubstituto"
                    ).value.trim(),

                cidade:
                    elemento(
                        "transferenciaCidade"
                    ).value.trim(),

                motivo:
                    elemento(
                        "transferenciaMotivo"
                    ).value.trim(),

                meli:
                    elemento(
                        "transferenciaMeli"
                    ).value.trim(),

                observacoes:
                    elemento(
                        "transferenciaObservacoes"
                    ).value.trim(),

                lancadoPor:
                    user.email,

                criadoEm:
                    Date.now(),

                hora:
                    new Date()
                        .toLocaleTimeString(
                            "pt-BR",
                            {
                                hour:
                                    "2-digit",

                                minute:
                                    "2-digit"
                            }
                        )
            };


            try {

                const novaReferencia =
                    push(
                        ref(
                            db,
                            "transferencias"
                        )
                    );


                await set(
                    novaReferencia,
                    dados
                );


                mostrarToast(
                    "Transferência lançada com sucesso!",
                    "sucesso"
                );


                form.reset();


                elemento(
                    "transferenciaData"
                ).value =
                    hoje();


                await carregarDados();

            } catch (error) {

                console.error(
                    "Erro ao salvar transferência:",
                    error
                );


                mostrarToast(
                    "Erro ao salvar transferência.",
                    "erro"
                );
            }
        }
    );
}


// ======================================================
// APOIO
// ======================================================

function configurarFormularioApoio() {

    const form =
        elemento(
            "formApoio"
        );


    if (!form) {
        return;
    }


    form.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                auth.currentUser;


            if (!user) {

                mostrarToast(
                    "Faça login novamente.",
                    "erro"
                );

                return;
            }


            const dados = {

                data:
                    elemento(
                        "apoioData"
                    ).value,

                rota:
                    elemento(
                        "apoioRota"
                    ).value.trim(),

                valor:
                    Number(
                        elemento(
                            "apoioValor"
                        ).value
                    ) || 0,

                driver:
                    elemento(
                        "apoioDriver"
                    ).value.trim(),

                driverAjudado:
                    elemento(
                        "apoioDriverAjudado"
                    ).value.trim(),

                meli:
                    elemento(
                        "apoioMeli"
                    ).value.trim(),

                observacoes:
                    elemento(
                        "apoioObservacoes"
                    ).value.trim(),

                lancadoPor:
                    user.email,

                criadoEm:
                    Date.now(),

                hora:
                    new Date()
                        .toLocaleTimeString(
                            "pt-BR",
                            {
                                hour:
                                    "2-digit",

                                minute:
                                    "2-digit"
                            }
                        )
            };


            try {

                const novaReferencia =
                    push(
                        ref(
                            db,
                            "apoios"
                        )
                    );


                await set(
                    novaReferencia,
                    dados
                );


                mostrarToast(
                    "Apoio lançado com sucesso!",
                    "sucesso"
                );


                form.reset();


                elemento(
                    "apoioData"
                ).value =
                    hoje();


                await carregarDados();

            } catch (error) {

                console.error(
                    "Erro ao salvar apoio:",
                    error
                );


                mostrarToast(
                    "Erro ao salvar apoio.",
                    "erro"
                );
            }
        }
    );
}


// ======================================================
// DASHBOARD
// ======================================================

function atualizarDashboard() {

    const ambulancias =
        todosRegistros.filter(
            item =>
                item.tipo ===
                "ambulancia"
        );


    const transferencias =
        todosRegistros.filter(
            item =>
                item.tipo ===
                "transferencia"
        );


    const apoios =
        todosRegistros.filter(
            item =>
                item.tipo ===
                "apoio"
        );


    const total =
        todosRegistros.length;


    const dataHoje =
        hoje();


    const ambulanciasHoje =
        ambulancias.filter(
            item =>
                item.data ===
                dataHoje
        );


    const transferenciasHoje =
        transferencias.filter(
            item =>
                item.data ===
                dataHoje
        );


    const apoiosHoje =
        apoios.filter(
            item =>
                item.data ===
                dataHoje
        );


    const valorHoje =
        apoiosHoje.reduce(
            function (
                totalAtual,
                item
            ) {

                return totalAtual +
                    (
                        Number(
                            item.valor
                        ) || 0
                    );
            },
            0
        );


    const valorTotal =
        apoios.reduce(
            function (
                totalAtual,
                item
            ) {

                return totalAtual +
                    (
                        Number(
                            item.valor
                        ) || 0
                    );
            },
            0
        );


    const valores = {

        totalAmbulancias:
            ambulancias.length,

        totalTransferencias:
            transferencias.length,

        totalApoios:
            apoios.length,

        totalGeral:
            total,

        ambulanciasHoje:
            ambulanciasHoje.length,

        transferenciasHoje:
            transferenciasHoje.length,

        apoiosHoje:
            apoiosHoje.length
    };


    Object.keys(valores)
        .forEach(
            function (id) {

                const el =
                    elemento(id);


                if (el) {

                    el.textContent =
                        valores[id];
                }
            }
        );


    const apoioValorHoje =
        elemento(
            "apoioValorHoje"
        );


    if (apoioValorHoje) {

        apoioValorHoje.textContent =
            formatarMoeda(
                valorHoje
            );
    }


    const valorTotalApoio =
        elemento(
            "valorTotalApoio"
        );


    if (valorTotalApoio) {

        valorTotalApoio.textContent =
            formatarMoeda(
                valorTotal
            );
    }


    const grafico =
        elemento(
            "graficoDistribuicao"
        );


    if (grafico) {

        const maior =
            Math.max(
                ambulancias.length,
                transferencias.length,
                apoios.length,
                1
            );


        grafico.innerHTML = `

            <div class="barra-item">

                <div class="barra-info">
                    <span>Ambulâncias</span>

                    <strong>
                        ${ambulancias.length}
                    </strong>
                </div>

                <div class="barra-fundo">

                    <div
                        class="barra"
                        style="width:${
                            (
                                ambulancias.length /
                                maior
                            ) * 100
                        }%"
                    ></div>

                </div>

            </div>


            <div class="barra-item">

                <div class="barra-info">
                    <span>Transferências</span>

                    <strong>
                        ${transferencias.length}
                    </strong>
                </div>

                <div class="barra-fundo">

                    <div
                        class="barra"
                        style="width:${
                            (
                                transferencias.length /
                                maior
                            ) * 100
                        }%"
                    ></div>

                </div>

            </div>


            <div class="barra-item">

                <div class="barra-info">
                    <span>Apoios</span>

                    <strong>
                        ${apoios.length}
                    </strong>
                </div>

                <div class="barra-fundo">

                    <div
                        class="barra"
                        style="width:${
                            (
                                apoios.length /
                                maior
                            ) * 100
                        }%"
                    ></div>

                </div>

            </div>

        `;
    }


    const ultimos =
        elemento(
            "ultimosLancamentos"
        );


    if (ultimos) {

        const recentes =
            todosRegistros.slice(
                0,
                8
            );


        ultimos.innerHTML =
            criarListaRegistros(
                recentes
            );
    }
}


// ======================================================
// REGISTROS
// ======================================================

function criarListaRegistros(
    registros
) {

    if (!registros.length) {

        return `
            <div class="estado-vazio">
                Nenhum registro encontrado.
            </div>
        `;
    }


    return registros
        .map(
            function (registro) {

                let tipoTexto =
                    "Registro";

                let icone =
                    "📋";


                if (
                    registro.tipo ===
                    "ambulancia"
                ) {

                    tipoTexto =
                        "Ambulância";

                    icone =
                        "🚑";
                }


                if (
                    registro.tipo ===
                    "transferencia"
                ) {

                    tipoTexto =
                        "Transferência";

                    icone =
                        "🔄";
                }


                if (
                    registro.tipo ===
                    "apoio"
                ) {

                    tipoTexto =
                        "Apoio";

                    icone =
                        "🤝";
                }


                let motorista =
                    registro.driver ||
                    registro.driverInicial ||
                    "-";


                if (
                    registro.tipo ===
                    "transferencia"
                ) {

                    motorista =
                        `${
                            registro.driverInicial ||
                            "-"
                        } → ${
                            registro.driverSubstituto ||
                            "-"
                        }`;
                }


                return `

                    <div class="registro-item">

                        <div class="registro-icone">
                            ${icone}
                        </div>

                        <div class="registro-info">

                            <strong>
                                ${tipoTexto}
                            </strong>

                            <span>
                                Rota:
                                ${registro.rota || "-"}
                            </span>

                            <span>
                                Motorista:
                                ${motorista}
                            </span>

                            <span>
                                ${formatarData(
                                    registro.data
                                )}
                            </span>

                        </div>

                        <div class="registro-acoes">

                            <button
                                type="button"
                                class="btn-excluir"
                                onclick="excluirRegistro(
                                    '${registro.tipo}',
                                    '${registro.id}'
                                )"
                            >
                                Excluir
                            </button>

                        </div>

                    </div>

                `;
            }
        )
        .join("");
}


function renderizarRegistros() {

    const lista =
        elemento(
            "listaRegistros"
        );


    if (!lista) {
        return;
    }


    const filtroData =
        elemento(
            "filtroData"
        )?.value || "";


    const filtroRota =
        elemento(
            "filtroRota"
        )?.value
            .trim()
            .toLowerCase() || "";


    const filtroDriver =
        elemento(
            "filtroDriver"
        )?.value
            .trim()
            .toLowerCase() || "";


    const filtroTipo =
        elemento(
            "filtroTipo"
        )?.value || "";


    const filtrados =
        todosRegistros.filter(
            function (registro) {

                if (
                    filtroData &&
                    registro.data !==
                    filtroData
                ) {

                    return false;
                }


                if (
                    filtroRota &&
                    !String(
                        registro.rota || ""
                    )
                        .toLowerCase()
                        .includes(
                            filtroRota
                        )
                ) {

                    return false;
                }


                if (filtroTipo) {

                    if (
                        registro.tipo !==
                        filtroTipo
                    ) {

                        return false;
                    }
                }


                if (filtroDriver) {

                    const textoMotorista = [

                        registro.driver ||
                            "",

                        registro.driverInicial ||
                            "",

                        registro.driverSubstituto ||
                            "",

                        registro.driverAjudado ||
                            ""

                    ]
                        .join(" ")
                        .toLowerCase();


                    if (
                        !textoMotorista.includes(
                            filtroDriver
                        )
                    ) {

                        return false;
                    }
                }


                return true;
            }
        );


    lista.innerHTML =
        criarListaRegistros(
            filtrados
        );
}


// ======================================================
// FILTROS
// ======================================================

function configurarFiltros() {

    [
        "filtroData",
        "filtroRota",
        "filtroDriver",
        "filtroTipo"
    ].forEach(
        function (id) {

            const el =
                elemento(id);


            if (!el) {
                return;
            }


            el.addEventListener(
                "input",
                renderizarRegistros
            );


            el.addEventListener(
                "change",
                renderizarRegistros
            );
        }
    );


    const btnLimparFiltros =
        elemento(
            "btnLimparFiltros"
        );


    if (btnLimparFiltros) {

        btnLimparFiltros.addEventListener(
            "click",
            function () {

                const data =
                    elemento(
                        "filtroData"
                    );

                const rota =
                    elemento(
                        "filtroRota"
                    );

                const driver =
                    elemento(
                        "filtroDriver"
                    );

                const tipo =
                    elemento(
                        "filtroTipo"
                    );


                if (data) {
                    data.value = "";
                }


                if (rota) {
                    rota.value = "";
                }


                if (driver) {
                    driver.value = "";
                }


                if (tipo) {
                    tipo.value = "";
                }


                renderizarRegistros();
            }
        );
    }
}


// ======================================================
// EXCLUIR REGISTRO
// ======================================================

window.excluirRegistro =
    async function (
        tipo,
        id
    ) {

        const confirmar =
            confirm(
                "Tem certeza que deseja excluir este registro?"
            );


        if (!confirmar) {
            return;
        }


        const caminhos = {

            ambulancia:
                "ambulancias",

            transferencia:
                "transferencias",

            apoio:
                "apoios"
        };


        const caminho =
            caminhos[tipo];


        if (!caminho) {
            return;
        }


        try {

            await remove(
                ref(
                    db,
                    `${caminho}/${id}`
                )
            );


            mostrarToast(
                "Registro excluído.",
                "sucesso"
            );


            await carregarDados();

        } catch (error) {

            console.error(
                "Erro ao excluir:",
                error
            );


            mostrarToast(
                "Não foi possível excluir.",
                "erro"
            );
        }
    };


// ======================================================
// ALTERAR SENHA
// ======================================================

function configurarAlterarSenha() {

    const btnAlterarSenha =
        elemento(
            "btnAlterarSenha"
        );


    if (btnAlterarSenha) {

        btnAlterarSenha.addEventListener(
            "click",
            function () {

                mostrarElemento(
                    "modalSenha"
                );
            }
        );
    }


    const formAlterarSenha =
        elemento(
            "formAlterarSenha"
        );


    if (!formAlterarSenha) {
        return;
    }


    formAlterarSenha.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();


            const user =
                auth.currentUser;


            if (!user) {
                return;
            }


            const senhaAtual =
                elemento(
                    "senhaAtual"
                ).value;


            const novaSenha =
                elemento(
                    "novaSenha"
                ).value;


            const confirmar =
                elemento(
                    "confirmarNovaSenha"
                ).value;


            const mensagem =
                elemento(
                    "mensagemSenha"
                );


            if (
                novaSenha !==
                confirmar
            ) {

                mensagem.textContent =
                    "As novas senhas não conferem.";

                mensagem.className =
                    "mensagem erro";

                return;
            }


            if (
                novaSenha.length < 6
            ) {

                mensagem.textContent =
                    "A nova senha deve ter pelo menos 6 caracteres.";

                mensagem.className =
                    "mensagem erro";

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


                mensagem.textContent =
                    "Senha alterada com sucesso.";

                mensagem.className =
                    "mensagem sucesso";


                formAlterarSenha.reset();

            } catch (error) {

                console.error(
                    "Erro ao alterar senha:",
                    error
                );


                mensagem.textContent =
                    "Não foi possível alterar a senha. Verifique sua senha atual.";

                mensagem.className =
                    "mensagem erro";
            }
        }
    );
}


// ======================================================
// FECHAR MODAIS
// ======================================================

function configurarModais() {

    document
        .querySelectorAll(
            "[data-fechar-modal]"
        )
        .forEach(
            function (botao) {

                botao.addEventListener(
                    "click",
                    function () {

                        const modalId =
                            botao.getAttribute(
                                "data-fechar-modal"
                            );


                        esconderElemento(
                            modalId
                        );
                    }
                );
            }
        );


    document
        .querySelectorAll(
            ".modal-overlay"
        )
        .forEach(
            function (modal) {

                modal.addEventListener(
                    "click",
                    function (event) {

                        if (
                            event.target ===
                            modal
                        ) {

                            modal.classList.add(
                                "oculto"
                            );

                            modal.style.display =
                                "none";
                        }
                    }
                );
            }
        );
}


// ======================================================
// INICIALIZAÇÃO
// ======================================================

function inicializarSistema() {

    console.log(
        "Iniciando Caxiense Controle Operacional..."
    );


    configurarLogin();

    configurarRecuperacaoSenha();

    configurarLogout();

    configurarSidebar();

    configurarNavegacao();

    configurarFormularioAmbulancia();

    configurarFormularioTransferencia();

    configurarFormularioApoio();

    configurarFiltros();

    configurarAlterarSenha();

    configurarModais();


    const dataHoje =
        hoje();


    const camposData = [

        "ambulanciaData",

        "transferenciaData",

        "apoioData"

    ];


    camposData.forEach(
        function (id) {

            const campo =
                elemento(id);


            if (campo) {

                campo.value =
                    dataHoje;
            }
        }
    );


    console.log(
        "Caxiense Controle Operacional carregado com sucesso."
    );
}


// ======================================================
// DOM READY
// ======================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        inicializarSistema
    );

} else {

    inicializarSistema();
}
