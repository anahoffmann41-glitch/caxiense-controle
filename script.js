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

let toastTimeout;


/* =========================================================
   HELPERS
========================================================= */

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
        return data;
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
    elemento,
    mensagem,
    tipo = "erro"
) {

    if (!elemento) {
        return;
    }

    elemento.textContent = mensagem;

    elemento.className =
        `mensagem ${tipo}`;
}


function mostrarToast(
    mensagem,
    tipo = "normal"
) {

    const toast =
        document.getElementById("toast");

    if (!toast) {
        return;
    }

    clearTimeout(toastTimeout);

    toast.textContent = mensagem;

    toast.className =
        `toast mostrar ${tipo}`;

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

        const campo =
            document.getElementById(id);

        if (campo) {
            campo.value = hoje;
        }

    });


    const dataDashboard =
        document.getElementById(
            "dataDashboard"
        );

    if (dataDashboard) {

        dataDashboard.textContent =
            formatarData(hoje);
    }


    const dataTopbar =
        document.getElementById(
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

const formLogin =
    document.getElementById("formLogin");


if (formLogin) {

    formLogin.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();

            const email =
                document.getElementById(
                    "loginEmail"
                ).value.trim();

            const senha =
                document.getElementById(
                    "loginSenha"
                ).value;

            const mensagem =
                document.getElementById(
                    "mensagemLogin"
                );


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

                mensagem.textContent = "";

                mensagem.className =
                    "mensagem";

            } catch (erro) {

                console.error(erro);

                let texto =
                    "Não foi possível entrar. Verifique o e-mail e a senha.";

                if (
                    erro.code ===
                    "auth/invalid-credential"
                ) {

                    texto =
                        "E-mail ou senha incorretos.";

                } else if (
                    erro.code ===
                    "auth/user-not-found"
                ) {

                    texto =
                        "Usuário não encontrado.";

                } else if (
                    erro.code ===
                    "auth/wrong-password"
                ) {

                    texto =
                        "Senha incorreta.";

                } else if (
                    erro.code ===
                    "auth/too-many-requests"
                ) {

                    texto =
                        "Muitas tentativas. Aguarde alguns minutos.";

                } else if (
                    erro.code ===
                    "auth/invalid-api-key"
                ) {

                    texto =
                        "Erro de configuração da autenticação.";

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
            document.getElementById(
                "telaLogin"
            );

        const sistema =
            document.getElementById(
                "sistema"
            );


        if (usuarioAtual) {

            telaLogin.classList.add(
                "oculto"
            );

            sistema.classList.remove(
                "oculto"
            );


            atualizarUsuario();

            preencherDatas();

            carregarDashboard();

            carregarRegistros();

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
        document.getElementById(
            "nomeUsuario"
        );

    const emailUsuario =
        document.getElementById(
            "emailUsuario"
        );


    if (nomeUsuario) {

        nomeUsuario.textContent =
            nome;
    }


    if (emailUsuario) {

        emailUsuario.textContent =
            email;
    }


    const avatar =
        document.querySelector(
            ".avatar"
        );

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

    } catch (erro) {

        console.error(erro);

        mostrarToast(
            "Não foi possível sair do sistema."
        );
    }

};


/* =========================================================
   SIDEBAR MOBILE
========================================================= */

window.alternarSidebar = function () {

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


function fecharSidebarMobile() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );


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
        elemento => {

            elemento.classList.remove(
                "ativa"
            );

        }
    );


    const paginaAtual =
        document.getElementById(
            `pagina${pagina.charAt(0).toUpperCase()}${pagina.slice(1)}`
        );


    if (paginaAtual) {

        paginaAtual.classList.add(
            "ativa"
        );

    }


    const menus = {

        dashboard:
            "menuDashboard",

        ambulancia:
            "menuAmbulancia",

        transferencia:
            "menuTransferencia",

        apoio:
            "menuApoio",

        registros:
            "menuRegistros"

    };


    Object.values(menus).forEach(
        id => {

            const elemento =
                document.getElementById(id);

            if (elemento) {

                elemento.classList.remove(
                    "ativo"
                );

            }

        }
    );


    const menuAtual =
        document.getElementById(
            menus[pagina]
        );


    if (menuAtual) {

        menuAtual.classList.add(
            "ativo"
        );

    }


    const nomes = {

        dashboard: "Dashboard",

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
        document.getElementById(
            "tituloPagina"
        );


    if (titulo) {

        titulo.textContent =
            nomes[pagina] || "Dashboard";

    }


    const breadcrumb =
        document.getElementById(
            "breadcrumb"
        );


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
    document.getElementById(
        "formAmbulancia"
    );


if (formAmbulancia) {

    formAmbulancia.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();


            if (!usuario) {
                return;
            }


            const registro = {

                tipo: "ambulancia",

                data:
                    document.getElementById(
                        "dataAmbulancia"
                    ).value,

                rota:
                    document.getElementById(
                        "rotaAmbulancia"
                    ).value.trim(),

                driver:
                    document.getElementById(
                        "driverAmbulancia"
                    ).value.trim(),

                cidade:
                    document.getElementById(
                        "cidadeAmbulancia"
                    ).value.trim(),

                pacotes:
                    Number(
                        document.getElementById(
                            "pacotesAmbulancia"
                        ).value
                    ) || 0,

                motivo:
                    document.getElementById(
                        "motivoAmbulancia"
                    ).value.trim(),

                meli:
                    document.getElementById(
                        "meliAmbulancia"
                    ).value.trim(),

                observacoes:
                    document.getElementById(
                        "obsAmbulancia"
                    ).value.trim(),

                lancadoPor:
                    usuario.email,

                criadoEm:
                    Date.now()

            };


            try {

                await push(
                    ref(db, "ambulancias"),
                    registro
                );


                formAmbulancia.reset();

                preencherDatas();


                mostrarToast(
                    "Ambulância registrada com sucesso."
                );


                carregarDashboard();

                carregarRegistros();

            } catch (erro) {

                console.error(erro);

                mostrarToast(
                    "Erro ao registrar a ambulância."
                );

            }

        }
    );

}


/* =========================================================
   TRANSFERÊNCIA
========================================================= */

const formTransferencia =
    document.getElementById(
        "formTransferencia"
    );


if (formTransferencia) {

    formTransferencia.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();


            if (!usuario) {
                return;
            }


            const registro = {

                tipo: "transferencia",

                data:
                    document.getElementById(
                        "dataTransferencia"
                    ).value,

                rota:
                    document.getElementById(
                        "rotaTransferencia"
                    ).value.trim(),

                driverInicial:
                    document.getElementById(
                        "driverInicial"
                    ).value.trim(),

                driverSubstituto:
                    document.getElementById(
                        "driverSubstituto"
                    ).value.trim(),

                driver:
                    document.getElementById(
                        "driverSubstituto"
                    ).value.trim(),

                cidade:
                    document.getElementById(
                        "cidadeTransferencia"
                    ).value.trim(),

                motivo:
                    document.getElementById(
                        "motivoTransferencia"
                    ).value.trim(),

                meli:
                    document.getElementById(
                        "meliTransferencia"
                    ).value.trim(),

                observacoes:
                    document.getElementById(
                        "obsTransferencia"
                    ).value.trim(),

                lancadoPor:
                    usuario.email,

                criadoEm:
                    Date.now()

            };


            try {

                await push(
                    ref(db, "transferencias"),
                    registro
                );


                formTransferencia.reset();

                preencherDatas();


                mostrarToast(
                    "Transferência registrada com sucesso."
                );


                carregarDashboard();

                carregarRegistros();

            } catch (erro) {

                console.error(erro);

                mostrarToast(
                    "Erro ao registrar a transferência."
                );

            }

        }
    );

}


/* =========================================================
   APOIO
========================================================= */

const formApoio =
    document.getElementById(
        "formApoio"
    );


if (formApoio) {

    formApoio.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();


            if (!usuario) {
                return;
            }


            const registro = {

                tipo: "apoio",

                data:
                    document.getElementById(
                        "dataApoio"
                    ).value,

                rota:
                    document.getElementById(
                        "rotaApoio"
                    ).value.trim(),

                valor:
                    Number(
                        document.getElementById(
                            "valorApoio"
                        ).value
                    ) || 0,

                driverRealiza:
                    document.getElementById(
                        "driverRealizaApoio"
                    ).value.trim(),

                driverPrecisa:
                    document.getElementById(
                        "driverPrecisaApoio"
                    ).value.trim(),

                driver:
                    document.getElementById(
                        "driverRealizaApoio"
                    ).value.trim(),

                quemLiberou:
                    document.getElementById(
                        "quemLiberouApoio"
                    ).value.trim(),

                observacoes:
                    document.getElementById(
                        "obsApoio"
                    ).value.trim(),

                lancadoPor:
                    usuario.email,

                criadoEm:
                    Date.now()

            };


            try {

                await push(
                    ref(db, "apoios"),
                    registro
                );


                formApoio.reset();

                preencherDatas();


                mostrarToast(
                    "Apoio registrado com sucesso."
                );


                carregarDashboard();

                carregarRegistros();

            } catch (erro) {

                console.error(erro);

                mostrarToast(
                    "Erro ao registrar o apoio."
                );

            }

        }
    );

}


/* =========================================================
   CARREGAR DASHBOARD
========================================================= */

function carregarDashboard() {

    const dados = [];

    let finalizados = 0;


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


    caminhos.forEach(item => {

        onValue(
            ref(db, item.caminho),
            snapshot => {

                const valor =
                    snapshot.val() || {};


                Object.entries(valor)
                    .forEach(
                        ([id, registro]) => {

                            dados.push({
                                ...registro,
                                id,
                                tipo: item.tipo
                            });

                        }
                    );


                finalizados++;


                if (
                    finalizados ===
                    caminhos.length
                ) {

                    todosRegistros =
                        dados.sort(
                            (a, b) =>
                                Number(
                                    b.criadoEm || 0
                                ) -
                                Number(
                                    a.criadoEm || 0
                                )
                        );


                    atualizarDashboard();

                    renderizarRegistros(
                        todosRegistros
                    );

                }

            },
            {
                onlyOnce: true
            }
        );

    });

}


/* =========================================================
   ATUALIZAR DASHBOARD
========================================================= */

function atualizarDashboard() {

    const registros =
        todosRegistros || [];


    const ambulancias =
        registros.filter(
            r =>
                r.tipo ===
                "ambulancia"
        );


    const transferencias =
        registros.filter(
            r =>
                r.tipo ===
                "transferencia"
        );


    const apoios =
        registros.filter(
            r =>
                r.tipo ===
                "apoio"
        );


    const total =
        registros.length;


    const valorTotal =
        apoios.reduce(
            (soma, registro) =>
                soma +
                (Number(
                    registro.valor
                ) || 0),
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
        formatarMoeda(valorTotal)
    );


    const hoje =
        hojeISO();


    const hojeAmb =
        ambulancias.filter(
            r => r.data === hoje
        ).length;


    const hojeTrans =
        transferencias.filter(
            r => r.data === hoje
        ).length;


    const hojeApoio =
        apoios.filter(
            r => r.data === hoje
        );


    const hojeValor =
        hojeApoio.reduce(
            (soma, r) =>
                soma +
                (Number(
                    r.valor
                ) || 0),
            0
        );


    definirTexto(
        "hojeAmbulancias",
        hojeAmb
    );

    definirTexto(
        "hojeTransferencias",
        hojeTrans
    );

    definirTexto(
        "hojeApoios",
        hojeApoio.length
    );

    definirTexto(
        "hojeValorApoios",
        formatarMoeda(hojeValor)
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
        ambulancias.length / maior * 100
    );

    definirLargura(
        "barraTransferencias",
        transferencias.length / maior * 100
    );

    definirLargura(
        "barraApoios",
        apoios.length / maior * 100
    );


    criarUltimosLancamentos(
        registros.slice(0, 6)
    );

}


function definirTexto(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);

    if (elemento) {

        elemento.textContent =
            valor;
    }

}


function definirLargura(
    id,
    valor
) {

    const elemento =
        document.getElementById(id);

    if (!elemento) {
        return;
    }

    elemento.style.width =
        `${Math.max(0, Math.min(100, valor))}%`;

}


/* =========================================================
   MINI REGISTROS
========================================================= */

function criarUltimosLancamentos(
    registros
) {

    const container =
        document.getElementById(
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
        registros.map(
            criarMiniRegistro
        ).join("");

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
                    • ${escaparHTML(identificacao)}
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
   REGISTROS
========================================================= */

function carregarRegistros() {

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
            ref(db, item.caminho),
            snapshot => {

                const valor =
                    snapshot.val() || {};


                resultados.push(
                    ...Object.entries(valor)
                        .map(
                            ([id, registro]) => ({
                                ...registro,
                                id,
                                tipo: item.tipo
                            })
                        )
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
   FILTROS
========================================================= */

function aplicarFiltros() {

    const data =
        document.getElementById(
            "filtroData"
        )?.value || "";


    const rota =
        document.getElementById(
            "filtroRota"
        )?.value
            .trim()
            .toLowerCase() || "";


    const driver =
        document.getElementById(
            "filtroDriver"
        )?.value
            .trim()
            .toLowerCase() || "";


    const tipo =
        document.getElementById(
            "filtroTipo"
        )?.value || "";


    const filtrados =
        todosRegistros.filter(
            registro => {

                const rotaRegistro =
                    String(
                        registro.rota || ""
                    ).toLowerCase();


                const drivers =
                    [
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

                    (!data ||
                        registro.data === data)

                    &&

                    (!rota ||
                        rotaRegistro.includes(rota))

                    &&

                    (!driver ||
                        drivers.includes(driver))

                    &&

                    (!tipo ||
                        registro.tipo === tipo)

                );

            }
        );


    renderizarRegistros(
        filtrados
    );

}


window.limparFiltros = function () {

    [
        "filtroData",
        "filtroRota",
        "filtroDriver"
    ].forEach(id => {

        const campo =
            document.getElementById(id);

        if (campo) {
            campo.value = "";
        }

    });


    const tipo =
        document.getElementById(
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
        document.getElementById(id);

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
        document.getElementById(
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
            .map(criarRegistroHTML)
            .join("");

}


/* =========================================================
   HTML DE REGISTRO
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
                        ${escaparHTML(config.nome)}
                    </strong>

                    <span>
                        ${escaparHTML(
                            registro.data
                                ? formatarData(registro.data)
                                : "Sem data"
                        )}
                    </span>

                </div>

            </div>


            <div class="registro-info">

                <strong>
                    ${escaparHTML(titulo)}
                </strong>

                <span>
                    ${escaparHTML(detalhes)}
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
                        registro.lancadoPor || "—"
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
                    onclick="excluirRegistro(
                        '${escaparHTML(
                            registro.tipo
                        )}',
                        '${escaparHTML(
                            registro.id
                        )}'
                    )"
                    title="Excluir registro"
                >
                    🗑
                </button>

            </div>

        </div>
    `;

}


/* =========================================================
   CONFIGURAÇÃO DOS TIPOS
========================================================= */

function obterConfigTipo(
    tipo
) {

    if (tipo === "ambulancia") {

        return {
            nome: "Ambulância",
            icone: "🚑",
            cor: "#16a34a",
            fundo: "#dcfce7"
        };

    }


    if (tipo === "transferencia") {

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
   EXCLUIR
========================================================= */

window.excluirRegistro = async function (
    tipo,
    id
) {

    if (!tipo || !id) {
        return;
    }


    const confirmacao =
        confirm(
            "Tem certeza que deseja excluir este registro?"
        );


    if (!confirmacao) {
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
            "Registro excluído com sucesso."
        );


        carregarDashboard();

        carregarRegistros();

    } catch (erro) {

        console.error(erro);

        mostrarToast(
            "Não foi possível excluir o registro."
        );

    }

};


/* =========================================================
   ALTERAR SENHA
========================================================= */

window.abrirAlterarSenha = function () {

    const modal =
        document.getElementById(
            "modalSenha"
        );


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "oculto"
    );


    document.getElementById(
        "formAlterarSenha"
    )?.reset();


    const mensagem =
        document.getElementById(
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
            document.getElementById(
                "modalSenha"
            );


        if (modal) {

            modal.classList.add(
                "oculto"
            );

        }

    };


const formAlterarSenha =
    document.getElementById(
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
                document.getElementById(
                    "senhaAtual"
                ).value;


            const novaSenha =
                document.getElementById(
                    "novaSenha"
                ).value;


            const confirmarSenha =
                document.getElementById(
                    "confirmarSenha"
                ).value;


            const mensagem =
                document.getElementById(
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


            if (novaSenha.length < 6) {

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


                setTimeout(() => {

                    fecharAlterarSenha();

                }, 1200);


            } catch (erro) {

                console.error(erro);


                let texto =
                    "Não foi possível alterar a senha.";


                if (
                    erro.code ===
                    "auth/invalid-credential"
                ) {

                    texto =
                        "A senha atual está incorreta.";

                } else if (
                    erro.code ===
                    "auth/wrong-password"
                ) {

                    texto =
                        "A senha atual está incorreta.";

                } else if (
                    erro.code ===
                    "auth/weak-password"
                ) {

                    texto =
                        "A nova senha é muito fraca.";

                } else if (
                    erro.code ===
                    "auth/requires-recent-login"
                ) {

                    texto =
                        "Faça login novamente e tente alterar a senha.";

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
            document.getElementById(
                "modalRecuperarSenha"
            );


        if (!modal) {
            return;
        }


        modal.classList.remove(
            "oculto"
        );


        const emailLogin =
            document.getElementById(
                "loginEmail"
            )?.value.trim();


        const emailRecuperacao =
            document.getElementById(
                "emailRecuperacao"
            );


        if (
            emailRecuperacao &&
            emailLogin
        ) {

            emailRecuperacao.value =
                emailLogin;

        }


        const mensagem =
            document.getElementById(
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
            document.getElementById(
                "modalRecuperarSenha"
            );


        if (modal) {

            modal.classList.add(
                "oculto"
            );

        }

    };


const formRecuperarSenha =
    document.getElementById(
        "formRecuperarSenha"
    );


if (formRecuperarSenha) {

    formRecuperarSenha.addEventListener(
        "submit",
        async evento => {

            evento.preventDefault();


            const email =
                document.getElementById(
                    "emailRecuperacao"
                ).value.trim();


            const mensagem =
                document.getElementById(
                    "mensagemRecuperacao"
                );


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

                console.error(erro);


                let texto =
                    "Não foi possível enviar o e-mail de recuperação.";


                if (
                    erro.code ===
                    "auth/user-not-found"
                ) {

                    texto =
                        "Não encontramos uma conta com esse e-mail.";

                } else if (
                    erro.code ===
                    "auth/invalid-email"
                ) {

                    texto =
                        "Digite um e-mail válido.";

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
   FECHAR MODAIS CLICANDO FORA
========================================================= */

window.addEventListener(
    "click",
    evento => {

        const modalSenha =
            document.getElementById(
                "modalSenha"
            );

        const modalRecuperacao =
            document.getElementById(
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
   FECHAR SIDEBAR AO CLICAR FORA
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
            document.getElementById(
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

    }
);