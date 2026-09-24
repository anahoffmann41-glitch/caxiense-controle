import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getDatabase,
    ref,
    push,
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


/* =========================================================
   FIREBASE
========================================================= */

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
const db = getDatabase(app);
const auth = getAuth(app);


/* =========================================================
   VARIÁVEIS
========================================================= */

let usuario = null;
let todosRegistros = [];
let toastTimeout = null;


/* =========================================================
   HELPERS
========================================================= */

function elemento(id) {
    return document.getElementById(id);
}


function hojeISO() {

    const agora = new Date();

    const ano = agora.getFullYear();

    const mes = String(
        agora.getMonth() + 1
    ).padStart(2, "0");

    const dia = String(
        agora.getDate()
    ).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}


function formatarData(data) {

    if (!data) {
        return "—";
    }

    const partes = String(data).split("-");

    if (partes.length !== 3) {
        return String(data);
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


function formatarMoeda(valor) {

    const numero = Number(valor) || 0;

    return numero.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}


function escaparHTML(valor) {

    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


function mostrarMensagem(
    campo,
    mensagem,
    tipo = "erro"
) {

    if (!campo) {
        return;
    }

    campo.textContent = mensagem;
    campo.className = `mensagem ${tipo}`;
}


function mostrarToast(
    mensagem,
    tipo = "normal"
) {

    const toast = elemento("toast");

    if (!toast) {
        return;
    }

    clearTimeout(toastTimeout);

    toast.textContent = mensagem;

    toast.className = `toast mostrar ${tipo}`;

    toastTimeout = setTimeout(() => {

        toast.classList.remove("mostrar");

    }, 3500);
}


/* =========================================================
   DATAS
========================================================= */

function preencherDatas() {

    const hoje = hojeISO();

    const campos = [
        "dataAmbulancia",
        "dataTransferencia",
        "dataApoio"
    ];

    campos.forEach(id => {

        const campo = elemento(id);

        if (campo && !campo.value) {
            campo.value = hoje;
        }

    });


    const dataDashboard = elemento(
        "dataDashboard"
    );

    if (dataDashboard) {
        dataDashboard.textContent =
            formatarData(hoje);
    }


    const dataTopbar = elemento(
        "dataTopbar"
    );

    if (dataTopbar) {
        dataTopbar.textContent =
            formatarData(hoje);
    }
}


/* =========================================================
   LOGIN
========================================================= */

const formLogin = elemento("formLogin");

if (formLogin) {

    formLogin.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();

            const emailCampo = elemento(
                "loginEmail"
            );

            const senhaCampo = elemento(
                "loginSenha"
            );

            const mensagem = elemento(
                "mensagemLogin"
            );

            if (!emailCampo || !senhaCampo) {
                return;
            }

            const email =
                emailCampo.value.trim();

            const senha =
                senhaCampo.value;

            if (!email || !senha) {

                mostrarMensagem(
                    mensagem,
                    "Informe o e-mail e a senha.",
                    "erro"
                );

                return;
            }


            mostrarMensagem(
                mensagem,
                "Entrando...",
                "sucesso"
            );


            try {

                await signInWithEmailAndPassword(
                    auth,
                    email,
                    senha
                );

                if (mensagem) {

                    mensagem.textContent = "";

                    mensagem.className =
                        "mensagem";
                }

            } catch (erro) {

                console.error(
                    "Erro no login:",
                    erro
                );

                let texto =
                    "Não foi possível entrar. Verifique o e-mail e a senha.";


                switch (erro.code) {

                    case "auth/invalid-credential":
                        texto =
                            "E-mail ou senha incorretos.";
                        break;

                    case "auth/user-not-found":
                        texto =
                            "Usuário não encontrado.";
                        break;

                    case "auth/wrong-password":
                        texto =
                            "Senha incorreta.";
                        break;

                    case "auth/too-many-requests":
                        texto =
                            "Muitas tentativas. Aguarde alguns minutos.";
                        break;

                    case "auth/invalid-api-key":
                        texto =
                            "Erro na configuração da autenticação.";
                        break;

                    case "auth/network-request-failed":
                        texto =
                            "Erro de conexão. Verifique sua internet.";
                        break;

                    case "auth/operation-not-allowed":
                        texto =
                            "O login por e-mail e senha não está habilitado no Firebase.";
                        break;
                }


                mostrarMensagem(
                    mensagem,
                    texto,
                    "erro"
                );
            }

        }
    );

}


/* =========================================================
   AUTENTICAÇÃO
========================================================= */

onAuthStateChanged(
    auth,
    usuarioAtual => {

        usuario = usuarioAtual;

        const telaLogin =
            elemento("telaLogin");

        const sistema =
            elemento("sistema");


        if (!telaLogin || !sistema) {
            console.error(
                "Elementos de login/sistema não encontrados no HTML."
            );
            return;
        }


        if (usuarioAtual) {

            telaLogin.classList.add(
                "oculto"
            );

            sistema.classList.remove(
                "oculto"
            );


            atualizarUsuario();

            preencherDatas();

            carregarDados();

            mostrarPagina(
                "dashboard"
            );

        } else {

            telaLogin.classList.remove(
                "oculto"
            );

            sistema.classList.add(
                "oculto"
            );

        }

    }
);


/* =========================================================
   USUÁRIO
========================================================= */

function atualizarUsuario() {

    if (!usuario) {
        return;
    }

    const email =
        usuario.email || "Usuário";

    const nome =
        email.includes("@")
            ? email.split("@")[0]
            : email;


    const nomeUsuario =
        elemento("nomeUsuario");

    const emailUsuario =
        elemento("emailUsuario");


    if (nomeUsuario) {
        nomeUsuario.textContent = nome;
    }


    if (emailUsuario) {
        emailUsuario.textContent = email;
    }


    const avatar =
        document.querySelector(".avatar");


    if (avatar) {

        avatar.textContent =
            nome
                .charAt(0)
                .toUpperCase();

    }

}


/* =========================================================
   SAIR
========================================================= */

window.sairSistema = async function () {

    try {

        await signOut(auth);

        mostrarToast(
            "Você saiu do sistema."
        );

    } catch (erro) {

        console.error(
            "Erro ao sair:",
            erro
        );

        mostrarToast(
            "Não foi possível sair do sistema.",
            "erro"
        );
    }

};


/* =========================================================
   SIDEBAR MOBILE
========================================================= */

window.alternarSidebar = function () {

    const sidebar =
        document.querySelector(".sidebar");

    if (!sidebar) {
        return;
    }

    sidebar.classList.toggle(
        "aberta"
    );
};


function fecharSidebarMobile() {

    const sidebar =
        document.querySelector(".sidebar");

    if (!sidebar) {
        return;
    }

    if (window.innerWidth <= 900) {

        sidebar.classList.remove(
            "aberta"
        );

    }

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

window.mostrarPagina = function (
    pagina
) {

    const paginas =
        document.querySelectorAll(
            ".pagina"
        );


    paginas.forEach(
        paginaElemento => {

            paginaElemento.classList.remove(
                "ativa"
            );

        }
    );


    const primeiraLetra =
        pagina.charAt(0).toUpperCase();

    const restante =
        pagina.slice(1);

    const paginaAtual =
        elemento(
            `pagina${primeiraLetra}${restante}`
        );


    if (paginaAtual) {

        paginaAtual.classList.add(
            "ativa"
        );

    }


    const menus = {

        dashboard: "menuDashboard",

        ambulancia: "menuAmbulancia",

        transferencia: "menuTransferencia",

        apoio: "menuApoio",

        registros: "menuRegistros"

    };


    Object.values(menus).forEach(
        id => {

            const menu =
                elemento(id);

            if (menu) {

                menu.classList.remove(
                    "ativo"
                );

            }

        }
    );


    const menuAtual =
        elemento(
            menus[pagina]
        );


    if (menuAtual) {

        menuAtual.classList.add(
            "ativo"
        );

    }


    const nomes = {

        dashboard:
            "Dashboard",

        ambulancia:
            "Lançar ambulância",

        transferencia:
            "Lançar transferência",

        apoio:
            "Lançar apoio de rota",

        registros:
            "Registros operacionais"

    };


    const titulo =
        elemento("tituloPagina");


    if (titulo) {

        titulo.textContent =
            nomes[pagina] || "Dashboard";

    }


    const breadcrumb =
        elemento("breadcrumb");


    if (breadcrumb) {

        breadcrumb.textContent =
            `Principal / ${nomes[pagina] || "Dashboard"}`;

    }


    fecharSidebarMobile();


    if (pagina === "dashboard") {
        atualizarDashboard();
    }


    if (pagina === "registros") {
        aplicarFiltros();
    }

};


/* =========================================================
   AMBULÂNCIA
========================================================= */

const formAmbulancia =
    elemento("formAmbulancia");


if (formAmbulancia) {

    formAmbulancia.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();


            if (!usuario) {

                mostrarToast(
                    "Faça login para registrar a operação.",
                    "erro"
                );

                return;
            }


            const registro = {

                tipo: "ambulancia",

                data:
                    elemento(
                        "dataAmbulancia"
                    ).value,

                rota:
                    elemento(
                        "rotaAmbulancia"
                    ).value.trim(),

                driver:
                    elemento(
                        "driverAmbulancia"
                    ).value.trim(),

                cidade:
                    elemento(
                        "cidadeAmbulancia"
                    ).value.trim(),

                pacotes:
                    Number(
                        elemento(
                            "pacotesAmbulancia"
                        ).value
                    ) || 0,

                motivo:
                    elemento(
                        "motivoAmbulancia"
                    ).value.trim(),

                meli:
                    elemento(
                        "meliAmbulancia"
                    ).value.trim(),

                observacoes:
                    elemento(
                        "obsAmbulancia"
                    ).value.trim(),

                lancadoPor:
                    usuario.email,

                criadoEm:
                    Date.now()

            };


            try {

                await push(
                    ref(
                        db,
                        "ambulancias"
                    ),
                    registro
                );


                formAmbulancia.reset();

                preencherDatas();

                mostrarToast(
                    "Ambulância registrada com sucesso.",
                    "sucesso"
                );

                carregarDados();


            } catch (erro) {

                console.error(
                    "Erro ao registrar ambulância:",
                    erro
                );

                mostrarToast(
                    "Erro ao registrar a ambulância.",
                    "erro"
                );

            }

        }
    );

}


/* =========================================================
   TRANSFERÊNCIA
========================================================= */

const formTransferencia =
    elemento("formTransferencia");


if (formTransferencia) {

    formTransferencia.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();


            if (!usuario) {

                mostrarToast(
                    "Faça login para registrar a operação.",
                    "erro"
                );

                return;
            }


            const registro = {

                tipo: "transferencia",

                data:
                    elemento(
                        "dataTransferencia"
                    ).value,

                rota:
                    elemento(
                        "rotaTransferencia"
                    ).value.trim(),

                driverInicial:
                    elemento(
                        "driverInicial"
                    ).value.trim(),

                driverSubstituto:
                    elemento(
                        "driverSubstituto"
                    ).value.trim(),

                driver:
                    elemento(
                        "driverSubstituto"
                    ).value.trim(),

                cidade:
                    elemento(
                        "cidadeTransferencia"
                    ).value.trim(),

                motivo:
                    elemento(
                        "motivoTransferencia"
                    ).value.trim(),

                meli:
                    elemento(
                        "meliTransferencia"
                    ).value.trim(),

                observacoes:
                    elemento(
                        "obsTransferencia"
                    ).value.trim(),

                lancadoPor:
                    usuario.email,

                criadoEm:
                    Date.now()

            };


            try {

                await push(
                    ref(
                        db,
                        "transferencias"
                    ),
                    registro
                );


                formTransferencia.reset();

                preencherDatas();

                mostrarToast(
                    "Transferência registrada com sucesso.",
                    "sucesso"
                );

                carregarDados();


            } catch (erro) {

                console.error(
                    "Erro ao registrar transferência:",
                    erro
                );

                mostrarToast(
                    "Erro ao registrar a transferência.",
                    "erro"
                );

            }

        }
    );

}


/* =========================================================
   APOIO
========================================================= */

const formApoio =
    elemento("formApoio");


if (formApoio) {

    formApoio.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();


            if (!usuario) {

                mostrarToast(
                    "Faça login para registrar a operação.",
                    "erro"
                );

                return;
            }


            const registro = {

                tipo: "apoio",

                data:
                    elemento(
                        "dataApoio"
                    ).value,

                rota:
                    elemento(
                        "rotaApoio"
                    ).value.trim(),

                valor:
                    Number(
                        elemento(
                            "valorApoio"
                        ).value
                    ) || 0,

                driverRealiza:
                    elemento(
                        "driverRealizaApoio"
                    ).value.trim(),

                driverPrecisa:
                    elemento(
                        "driverPrecisaApoio"
                    ).value.trim(),

                driver:
                    elemento(
                        "driverRealizaApoio"
                    ).value.trim(),

                quemLiberou:
                    elemento(
                        "quemLiberouApoio"
                    ).value.trim(),

                observacoes:
                    elemento(
                        "obsApoio"
                    ).value.trim(),

                lancadoPor:
                    usuario.email,

                criadoEm:
                    Date.now()

            };


            try {

                await push(
                    ref(
                        db,
                        "apoios"
                    ),
                    registro
                );


                formApoio.reset();

                preencherDatas();

                mostrarToast(
                    "Apoio registrado com sucesso.",
                    "sucesso"
                );

                carregarDados();


            } catch (erro) {

                console.error(
                    "Erro ao registrar apoio:",
                    erro
                );

                mostrarToast(
                    "Erro ao registrar o apoio.",
                    "erro"
                );

            }

        }
    );

}


/* =========================================================
   CARREGAR TODOS OS DADOS
========================================================= */

async function carregarDados() {

    if (!usuario) {
        return;
    }


    const caminhos = [
        {
            tipo: "ambulancia",
            caminho: "ambulancias"
        },
        {
            tipo: "transferencia",
            caminho: "transferencias"
        },
        {
            tipo: "apoio",
            caminho: "apoios"
        }
    ];


    const resultados = [];


    let carregados = 0;


    caminhos.forEach(item => {

        onValue(
            ref(
                db,
                item.caminho
            ),

            snapshot => {

                const valor =
                    snapshot.val() || {};


                const registros =
                    Object.entries(valor)
                        .map(
                            ([id, registro]) => ({
                                ...registro,
                                id,
                                tipo: item.tipo
                            })
                        );


                resultados.push(
                    ...registros
                );


                carregados++;


                if (
                    carregados ===
                    caminhos.length
                ) {

                    todosRegistros =
                        resultados.sort(
                            (a, b) =>
                                Number(
                                    b.criadoEm || 0
                                ) -
                                Number(
                                    a.criadoEm || 0
                                )
                        );


                    atualizarDashboard();

                    aplicarFiltros();

                }

            },

            {
                onlyOnce: true
            }

        );

    });

}


/* =========================================================
   DASHBOARD
========================================================= */

function atualizarDashboard() {

    const registros =
        todosRegistros || [];


    const ambulancias =
        registros.filter(
            registro =>
                registro.tipo ===
                "ambulancia"
        );


    const transferencias =
        registros.filter(
            registro =>
                registro.tipo ===
                "transferencia"
        );


    const apoios =
        registros.filter(
            registro =>
                registro.tipo ===
                "apoio"
        );


    const total =
        registros.length;


    const valorTotal =
        apoios.reduce(
            (totalValor, registro) =>
                totalValor +
                (
                    Number(
                        registro.valor
                    ) || 0
                ),
            0
        );


    definirTexto(
        "totalAmbulancias",
        ambulancias.length
    );


    definirTexto(
        "totalTransferencias",
        transferencias.length
    );


    definirTexto(
        "totalApoios",
        apoios.length
    );


    definirTexto(
        "totalGeral",
        total
    );


    definirTexto(
        "valorTotalApoios",
        formatarMoeda(
            valorTotal
        )
    );


    const hoje =
        hojeISO();


    const hojeAmbulancias =
        ambulancias.filter(
            registro =>
                registro.data === hoje
        );


    const hojeTransferencias =
        transferencias.filter(
            registro =>
                registro.data === hoje
        );


    const hojeApoios =
        apoios.filter(
            registro =>
                registro.data === hoje
        );


    const hojeValor =
        hojeApoios.reduce(
            (totalValor, registro) =>
                totalValor +
                (
                    Number(
                        registro.valor
                    ) || 0
                ),
            0
        );


    definirTexto(
        "hojeAmbulancias",
        hojeAmbulancias.length
    );


    definirTexto(
        "hojeTransferencias",
        hojeTransferencias.length
    );


    definirTexto(
        "hojeApoios",
        hojeApoios.length
    );


    definirTexto(
        "hojeValorApoios",
        formatarMoeda(
            hojeValor
        )
    );


    definirTexto(
        "barraAmbulanciasTexto",
        ambulancias.length
    );


    definirTexto(
        "barraTransferenciasTexto",
        transferencias.length
    );


    definirTexto(
        "barraApoiosTexto",
        apoios.length
    );


    const maior =
        Math.max(
            ambulancias.length,
            transferencias.length,
            apoios.length,
            1
        );


    definirLargura(
        "barraAmbulancias",
        ambulancias.length /
        maior *
        100
    );


    definirLargura(
        "barraTransferencias",
        transferencias.length /
        maior *
        100
    );


    definirLargura(
        "barraApoios",
        apoios.length /
        maior *
        100
    );


    criarUltimosLancamentos(
        registros.slice(
            0,
            6
        )
    );

}


/* =========================================================
   DEFINIR TEXTO
========================================================= */

function definirTexto(
    id,
    valor
) {

    const campo =
        elemento(id);

    if (campo) {

        campo.textContent =
            valor;

    }

}


/* =========================================================
   BARRAS
========================================================= */

function definirLargura(
    id,
    valor
) {

    const campo =
        elemento(id);

    if (!campo) {
        return;
    }


    const largura =
        Math.max(
            0,
            Math.min(
                100,
                Number(valor) || 0
            )
        );


    campo.style.width =
        `${largura}%`;

}


/* =========================================================
   ÚLTIMOS LANÇAMENTOS
========================================================= */

function criarUltimosLancamentos(
    registros
) {

    const container =
        elemento(
            "ultimosLancamentos"
        );


    if (!container) {
        return;
    }


    if (!registros.length) {

        container.innerHTML = `
            <div class="empty-state">
                Nenhum lançamento encontrado.
            </div>
        `;

        return;
    }


    container.innerHTML =
        registros
            .map(
                criarMiniRegistro
            )
            .join("");

}


function criarMiniRegistro(
    registro
) {

    const config =
        obterConfigTipo(
            registro.tipo
        );


    const identificacao =
        registro.rota ||
        registro.cidade ||
        "Sem identificação";


    const pessoa =
        registro.driver ||
        registro.driverSubstituto ||
        registro.driverRealiza ||
        "—";


    return `
        <div class="mini-registro">

            <div
                class="mini-icon"
                style="
                    background:${config.fundo};
                    color:${config.cor};
                "
            >
                ${config.icone}
            </div>

            <div class="mini-info">

                <strong>
                    ${escaparHTML(config.nome)}
                    •
                    ${escaparHTML(identificacao)}
                </strong>

                <span>
                    ${escaparHTML(pessoa)}
                </span>

            </div>

            <div class="mini-data">
                ${formatarData(registro.data)}
            </div>

        </div>
    `;

}


/* =========================================================
   FILTROS
========================================================= */

function aplicarFiltros() {

    const data =
        elemento(
            "filtroData"
        )?.value || "";


    const rota =
        elemento(
            "filtroRota"
        )?.value
            ?.trim()
            .toLowerCase() || "";


    const driver =
        elemento(
            "filtroDriver"
        )?.value
            ?.trim()
            .toLowerCase() || "";


    const tipo =
        elemento(
            "filtroTipo"
        )?.value || "";


    const filtrados =
        todosRegistros.filter(
            registro => {

                const rotaRegistro =
                    String(
                        registro.rota || ""
                    )
                    .toLowerCase();


                const motoristas = [

                    registro.driver,

                    registro.driverInicial,

                    registro.driverSubstituto,

                    registro.driverRealiza,

                    registro.driverPrecisa

                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();


                return (

                    (
                        !data ||
                        registro.data === data
                    )

                    &&

                    (
                        !rota ||
                        rotaRegistro.includes(rota)
                    )

                    &&

                    (
                        !driver ||
                        motoristas.includes(driver)
                    )

                    &&

                    (
                        !tipo ||
                        registro.tipo === tipo
                    )

                );

            }
        );


    renderizarRegistros(
        filtrados
    );

}


window.limparFiltros =
    function () {

        [
            "filtroData",
            "filtroRota",
            "filtroDriver"
        ].forEach(
            id => {

                const campo =
                    elemento(id);

                if (campo) {
                    campo.value = "";
                }

            }
        );


        const tipo =
            elemento(
                "filtroTipo"
            );


        if (tipo) {
            tipo.value = "";
        }


        renderizarRegistros(
            todosRegistros
        );

    };


/* =========================================================
   EVENTOS DOS FILTROS
========================================================= */

[
    "filtroData",
    "filtroRota",
    "filtroDriver",
    "filtroTipo"
].forEach(id => {

    const campo =
        elemento(id);


    if (!campo) {
        return;
    }


    campo.addEventListener(
        campo.tagName === "SELECT"
            ? "change"
            : "input",
        aplicarFiltros
    );

});


/* =========================================================
   RENDERIZAR REGISTROS
========================================================= */

function renderizarRegistros(
    registros
) {

    const lista =
        elemento(
            "listaRegistros"
        );


    if (!lista) {
        return;
    }


    if (!registros.length) {

        lista.innerHTML = `
            <div class="empty-state">
                Nenhum registro encontrado.
            </div>
        `;

        return;
    }


    lista.innerHTML =
        registros
            .map(
                criarRegistroHTML
            )
            .join("");

}


/* =========================================================
   REGISTRO HTML
========================================================= */

function criarRegistroHTML(
    registro
) {

    const config =
        obterConfigTipo(
            registro.tipo
        );


    let titulo = "";

    let detalhes = "";


    if (
        registro.tipo ===
        "ambulancia"
    ) {

        titulo =
            `Rota ${registro.rota || "—"}`;

        detalhes =
            `${registro.driver || "—"} • ${registro.cidade || "—"} • ${registro.pacotes || 0} pacotes`;

    }


    if (
        registro.tipo ===
        "transferencia"
    ) {

        titulo =
            `Rota ${registro.rota || "—"}`;

        detalhes =
            `${registro.driverInicial || "—"} → ${registro.driverSubstituto || "—"} • ${registro.cidade || "—"}`;

    }


    if (
        registro.tipo ===
        "apoio"
    ) {

        titulo =
            `Rota ${registro.rota || "—"}`;

        detalhes =
            `${registro.driverRealiza || "—"} apoiou ${registro.driverPrecisa || "—"} • ${formatarMoeda(registro.valor)}`;

    }


    const tipoSeguro =
        escaparHTML(
            registro.tipo
        );


    const idSeguro =
        escaparHTML(
            registro.id
        );


    return `
        <div class="registro-card">

            <div class="registro-tipo">

                <div
                    class="registro-tipo-icon"
                    style="
                        background:${config.fundo};
                        color:${config.cor};
                    "
                >
                    ${config.icone}
                </div>

                <div class="registro-tipo-text">

                    <strong>
                        ${escaparHTML(
                            config.nome
                        )}
                    </strong>

                    <span>
                        ${formatarData(
                            registro.data
                        )}
                    </span>

                </div>

            </div>


            <div class="registro-info">

                <strong>
                    ${escaparHTML(
                        titulo
                    )}
                </strong>

                <span>
                    ${escaparHTML(
                        detalhes
                    )}
                </span>


                ${
                    registro.motivo
                        ? `
                            <span>
                                Motivo:
                                ${escaparHTML(
                                    registro.motivo
                                )}
                            </span>
                        `
                        : ""
                }


                ${
                    registro.observacoes
                        ? `
                            <span>
                                Obs.:
                                ${escaparHTML(
                                    registro.observacoes
                                )}
                            </span>
                        `
                        : ""
                }


                <span>
                    Lançado por:
                    ${escaparHTML(
                        registro.lancadoPor ||
                        "—"
                    )}
                </span>

            </div>


            <div class="registro-extra">

                <span class="registro-data">

                    ${
                        registro.criadoEm
                            ? new Date(
                                registro.criadoEm
                            ).toLocaleString(
                                "pt-BR"
                            )
                            : "—"
                    }

                </span>


                <button
                    type="button"
                    class="btn-excluir"
                    onclick="excluirRegistro('${tipoSeguro}', '${idSeguro}')"
                    title="Excluir registro"
                >
                    🗑
                </button>

            </div>

        </div>
    `;

}


/* =========================================================
   TIPOS
========================================================= */

function obterConfigTipo(
    tipo
) {

    if (
        tipo ===
        "ambulancia"
    ) {

        return {

            nome: "Ambulância",

            icone: "🚑",

            cor: "#16a34a",

            fundo: "#dcfce7"

        };

    }


    if (
        tipo ===
        "transferencia"
    ) {

        return {

            nome: "Transferência",

            icone: "⇄",

            cor: "#2563eb",

            fundo: "#dbeafe"

        };

    }


    return {

        nome: "Apoio de rota",

        icone: "＋",

        cor: "#ea580c",

        fundo: "#ffedd5"

    };

}


/* =========================================================
   EXCLUIR REGISTRO
========================================================= */

window.excluirRegistro =
    async function (
        tipo,
        id
    ) {

        if (!tipo || !id) {
            return;
        }


        const confirmou =
            window.confirm(
                "Tem certeza que deseja excluir este registro?"
            );


        if (!confirmou) {
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
                "Registro excluído com sucesso.",
                "sucesso"
            );


            carregarDados();


        } catch (erro) {

            console.error(
                "Erro ao excluir:",
                erro
            );


            mostrarToast(
                "Não foi possível excluir o registro.",
                "erro"
            );

        }

    };


/* =========================================================
   ALTERAR SENHA
========================================================= */

window.abrirAlterarSenha =
    function () {

        const modal =
            elemento(
                "modalSenha"
            );


        if (!modal) {
            return;
        }


        modal.classList.remove(
            "oculto"
        );


        const form =
            elemento(
                "formAlterarSenha"
            );


        if (form) {
            form.reset();
        }


        const mensagem =
            elemento(
                "mensagemSenha"
            );


        if (mensagem) {

            mensagem.textContent = "";

            mensagem.className =
                "mensagem";

        }

    };


window.fecharAlterarSenha =
    function () {

        const modal =
            elemento(
                "modalSenha"
            );


        if (modal) {

            modal.classList.add(
                "oculto"
            );

        }

    };


const formAlterarSenha =
    elemento(
        "formAlterarSenha"
    );


if (formAlterarSenha) {

    formAlterarSenha.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();


            if (!usuario) {
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


            const confirmarSenha =
                elemento(
                    "confirmarSenha"
                ).value;


            const mensagem =
                elemento(
                    "mensagemSenha"
                );


            if (
                novaSenha !==
                confirmarSenha
            ) {

                mostrarMensagem(
                    mensagem,
                    "As novas senhas não coincidem.",
                    "erro"
                );

                return;
            }


            if (
                novaSenha.length < 6
            ) {

                mostrarMensagem(
                    mensagem,
                    "A nova senha precisa ter pelo menos 6 caracteres.",
                    "erro"
                );

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


                mostrarMensagem(
                    mensagem,
                    "Senha alterada com sucesso.",
                    "sucesso"
                );


                formAlterarSenha.reset();


                setTimeout(
                    () => {

                        fecharAlterarSenha();

                    },
                    1200
                );


            } catch (erro) {

                console.error(
                    "Erro ao alterar senha:",
                    erro
                );


                let texto =
                    "Não foi possível alterar a senha.";


                switch (erro.code) {

                    case "auth/invalid-credential":

                    case "auth/wrong-password":

                        texto =
                            "A senha atual está incorreta.";

                        break;


                    case "auth/weak-password":

                        texto =
                            "A nova senha é muito fraca.";

                        break;


                    case "auth/requires-recent-login":

                        texto =
                            "Faça login novamente e tente alterar a senha.";

                        break;

                }


                mostrarMensagem(
                    mensagem,
                    texto,
                    "erro"
                );

            }

        }
    );

}


/* =========================================================
   RECUPERAR SENHA
========================================================= */

window.abrirRecuperarSenha =
    function () {

        const modal =
            elemento(
                "modalRecuperarSenha"
            );


        if (!modal) {
            return;
        }


        modal.classList.remove(
            "oculto"
        );


        const emailLogin =
            elemento(
                "loginEmail"
            )?.value.trim();


        const emailRecuperacao =
            elemento(
                "emailRecuperacao"
            );


        if (
            emailLogin &&
            emailRecuperacao
        ) {

            emailRecuperacao.value =
                emailLogin;

        }


        const mensagem =
            elemento(
                "mensagemRecuperacao"
            );


        if (mensagem) {

            mensagem.textContent = "";

            mensagem.className =
                "mensagem";

        }

    };


window.fecharRecuperarSenha =
    function () {

        const modal =
            elemento(
                "modalRecuperarSenha"
            );


        if (modal) {

            modal.classList.add(
                "oculto"
            );

        }

    };


const formRecuperarSenha =
    elemento(
        "formRecuperarSenha"
    );


if (formRecuperarSenha) {

    formRecuperarSenha.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();


            const campoEmail =
                elemento(
                    "emailRecuperacao"
                );


            const mensagem =
                elemento(
                    "mensagemRecuperacao"
                );


            const email =
                campoEmail
                    ?.value
                    .trim();


            if (!email) {

                mostrarMensagem(
                    mensagem,
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


                mostrarMensagem(
                    mensagem,
                    "E-mail de recuperação enviado. Verifique também a caixa de spam.",
                    "sucesso"
                );


            } catch (erro) {

                console.error(
                    "Erro na recuperação:",
                    erro
                );


                let texto =
                    "Não foi possível enviar o e-mail de recuperação.";


                switch (erro.code) {

                    case "auth/user-not-found":

                        texto =
                            "Não encontramos uma conta com esse e-mail.";

                        break;


                    case "auth/invalid-email":

                        texto =
                            "Digite um e-mail válido.";

                        break;


                    case "auth/network-request-failed":

                        texto =
                            "Erro de conexão. Verifique sua internet.";

                        break;

                }


                mostrarMensagem(
                    mensagem,
                    texto,
                    "erro"
                );

            }

        }
    );

}


/* =========================================================
   FECHAR MODAIS
========================================================= */

window.addEventListener(
    "click",
    evento => {

        const modalSenha =
            elemento(
                "modalSenha"
            );


        const modalRecuperacao =
            elemento(
                "modalRecuperarSenha"
            );


        if (
            evento.target ===
            modalSenha
        ) {

            fecharAlterarSenha();

        }


        if (
            evento.target ===
            modalRecuperacao
        ) {

            fecharRecuperarSenha();

        }

    }
);


/* =========================================================
   FECHAR SIDEBAR MOBILE AO CLICAR FORA
========================================================= */

document.addEventListener(
    "click",
    evento => {

        if (
            window.innerWidth >
            900
        ) {
            return;
        }


        const sidebar =
            document.querySelector(
                ".sidebar"
            );


        const botao =
            elemento(
                "btnMenuMobile"
            );


        if (
            !sidebar ||
            !sidebar.classList.contains(
                "aberta"
            )
        ) {
            return;
        }


        if (
            sidebar.contains(
                evento.target
            )
        ) {
            return;
        }


        if (
            botao &&
            botao.contains(
                evento.target
            )
        ) {
            return;
        }


        sidebar.classList.remove(
            "aberta"
        );

    }
);


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        preencherDatas();

        console.log(
            "Caxiense LOG: sistema carregado."
        );

    }
);
