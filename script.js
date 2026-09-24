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



/* =========================
   FIREBASE
========================= */

const firebaseConfig = {

    /*
     * IMPORTANTE:
     * COLOQUE AQUI A MESMA API KEY
     * QUE JÁ ESTÁ FUNCIONANDO NO SEU SITE.
     */

    apiKey: "AIzaSyCZ3xorH3D9Z0vmIfd_zafyceLJekXJPaY",

    authDomain:
        "amb-e-trans-caxiense-log.firebaseapp.com",

    databaseURL:
        "https://amb-e-trans-caxiense-log-default-rtdb.firebaseio.com",

    projectId:
        "amb-e-trans-caxiense-log",

    storageBucket:
        "amb-e-trans-caxiense-log.firebasestorage.app",

    messagingSenderId:
        "194048564958",

    appId:
        "1:194048564958:web:af334ffd5d248ec9d76c4f"
};


const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const database = getDatabase(app);



/* =========================
   VARIÁVEIS
========================= */

let usuario = null;

let todosRegistros = [];



/* =========================
   LOGIN
========================= */

document
    .getElementById("formLogin")
    .addEventListener("submit", async function(event) {

        event.preventDefault();

        const email =
            document
                .getElementById("loginEmail")
                .value
                .trim();

        const senha =
            document
                .getElementById("loginSenha")
                .value;

        const mensagem =
            document.getElementById("mensagemLogin");


        mensagem.style.color = "#2563eb";

        mensagem.textContent =
            "⏳ Entrando...";


        try {

            await signInWithEmailAndPassword(
                auth,
                email,
                senha
            );

            mensagem.textContent = "";

        } catch (erro) {

            console.error(
                "Erro no login:",
                erro
            );

            mensagem.style.color = "#dc2626";

            if (
                erro.code ===
                "auth/invalid-credential"
            ) {

                mensagem.textContent =
                    "❌ E-mail ou senha incorretos.";

            } else if (
                erro.code ===
                "auth/user-disabled"
            ) {

                mensagem.textContent =
                    "❌ Esta conta foi desativada.";

            } else {

                mensagem.textContent =
                    "❌ Não foi possível entrar.";
            }
        }

    });



/* =========================
   ESTADO DO LOGIN
========================= */

onAuthStateChanged(
    auth,
    function(user) {

        usuario = user;

        const telaLogin =
            document.getElementById(
                "telaLogin"
            );

        const sistema =
            document.getElementById(
                "sistema"
            );


        if (user) {

            telaLogin.classList.add(
                "escondida"
            );

            sistema.classList.remove(
                "escondida"
            );


            document.getElementById(
                "nomeUsuario"
            ).textContent =
                "Logado como: " +
                user.email;


            carregarRegistros();

            mostrarPagina(
                "dashboard"
            );

        } else {

            telaLogin.classList.remove(
                "escondida"
            );

            sistema.classList.add(
                "escondida"
            );
        }

    }
);



/* =========================
   SAIR
========================= */

window.sairSistema = async function() {

    try {

        await signOut(auth);

    } catch (erro) {

        console.error(
            "Erro ao sair:",
            erro
        );
    }
};



/* =========================
   NAVEGAÇÃO
========================= */

window.mostrarPagina = function(pagina) {

    const paginas = [

        "paginaDashboard",
        "paginaAmbulancia",
        "paginaTransferencia",
        "paginaApoio",
        "paginaRegistros"

    ];


    paginas.forEach(
        function(id) {

            document
                .getElementById(id)
                .classList.add(
                    "escondida"
                );

        }
    );


    const paginaEscolhida =
        document.getElementById(
            "pagina" +
            pagina.charAt(0).toUpperCase() +
            pagina.slice(1)
        );


    if (paginaEscolhida) {

        paginaEscolhida.classList.remove(
            "escondida"
        );
    }


    if (pagina === "registros") {

        carregarRegistros();

    }

};



/* =========================
   DATA ATUAL
========================= */

function dataHoje() {

    const hoje = new Date();

    const ano =
        hoje.getFullYear();

    const mes =
        String(
            hoje.getMonth() + 1
        ).padStart(2, "0");

    const dia =
        String(
            hoje.getDate()
        ).padStart(2, "0");


    return `${ano}-${mes}-${dia}`;
}



document.getElementById(
    "dataAmbulancia"
).value = dataHoje();


document.getElementById(
    "dataTransferencia"
).value = dataHoje();


document.getElementById(
    "dataApoio"
).value = dataHoje();



/* =========================
   AMBULÂNCIA
========================= */

document
    .getElementById("formAmbulancia")
    .addEventListener("submit", async function(event) {

        event.preventDefault();


        if (!usuario) {

            alert(
                "Você precisa estar logado."
            );

            return;
        }


        const dados = {

            tipo: "ambulancia",

            data:
                document
                    .getElementById(
                        "dataAmbulancia"
                    )
                    .value,

            rotaId:
                document
                    .getElementById(
                        "rotaAmbulancia"
                    )
                    .value
                    .trim(),

            driver:
                document
                    .getElementById(
                        "driverAmbulancia"
                    )
                    .value
                    .trim(),

            cidade:
                document
                    .getElementById(
                        "cidadeAmbulancia"
                    )
                    .value
                    .trim(),

            pacotes:
                Number(
                    document
                        .getElementById(
                            "pacotesAmbulancia"
                        )
                        .value
                ),

            motivo:
                document
                    .getElementById(
                        "motivoAmbulancia"
                    )
                    .value
                    .trim(),

            meliLiberou:
                document
                    .getElementById(
                        "meliAmbulancia"
                    )
                    .value
                    .trim(),

            observacoes:
                document
                    .getElementById(
                        "obsAmbulancia"
                    )
                    .value
                    .trim(),

            lancadoPor:
                usuario.email,

            criadoEm:
                new Date().toISOString()
        };


        try {

            const novaReferencia =
                push(
                    ref(
                        database,
                        "ambulancias"
                    )
                );


            await set(
                novaReferencia,
                dados
            );


            document
                .getElementById(
                    "formAmbulancia"
                )
                .reset();


            document.getElementById(
                "dataAmbulancia"
            ).value = dataHoje();


            const mensagem =
                document.getElementById(
                    "mensagemAmbulancia"
                );


            mensagem.style.color =
                "#16a34a";

            mensagem.textContent =
                "✅ Ambulância registrada com sucesso!";


            atualizarDashboard();


        } catch (erro) {

            console.error(
                erro
            );


            const mensagem =
                document.getElementById(
                    "mensagemAmbulancia"
                );


            mensagem.style.color =
                "#dc2626";

            mensagem.textContent =
                "❌ Erro ao salvar a ambulância.";
        }

    });



/* =========================
   TRANSFERÊNCIA
========================= */

document
    .getElementById(
        "formTransferencia"
    )
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (!usuario) {

                alert(
                    "Você precisa estar logado."
                );

                return;
            }


            const dados = {

                tipo: "transferencia",

                data:
                    document
                        .getElementById(
                            "dataTransferencia"
                        )
                        .value,

                rotaId:
                    document
                        .getElementById(
                            "rotaTransferencia"
                        )
                        .value
                        .trim(),

                driverInicial:
                    document
                        .getElementById(
                            "driverInicial"
                        )
                        .value
                        .trim(),

                driverSubstituto:
                    document
                        .getElementById(
                            "driverSubstituto"
                        )
                        .value
                        .trim(),

                cidade:
                    document
                        .getElementById(
                            "cidadeTransferencia"
                        )
                        .value
                        .trim(),

                motivo:
                    document
                        .getElementById(
                            "motivoTransferencia"
                        )
                        .value
                        .trim(),

                meliLiberou:
                    document
                        .getElementById(
                            "meliTransferencia"
                        )
                        .value
                        .trim(),

                observacoes:
                    document
                        .getElementById(
                            "obsTransferencia"
                        )
                        .value
                        .trim(),

                lancadoPor:
                    usuario.email,

                criadoEm:
                    new Date().toISOString()
            };


            try {

                const novaReferencia =
                    push(
                        ref(
                            database,
                            "transferencias"
                        )
                    );


                await set(
                    novaReferencia,
                    dados
                );


                document
                    .getElementById(
                        "formTransferencia"
                    )
                    .reset();


                document.getElementById(
                    "dataTransferencia"
                ).value = dataHoje();


                const mensagem =
                    document.getElementById(
                        "mensagemTransferencia"
                    );


                mensagem.style.color =
                    "#16a34a";

                mensagem.textContent =
                    "✅ Transferência registrada com sucesso!";


                atualizarDashboard();


            } catch (erro) {

                console.error(
                    erro
                );


                const mensagem =
                    document.getElementById(
                        "mensagemTransferencia"
                    );


                mensagem.style.color =
                    "#dc2626";

                mensagem.textContent =
                    "❌ Erro ao salvar a transferência.";
            }

        }
    );



/* =========================
   APOIO DE ROTA
========================= */

document
    .getElementById("formApoio")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (!usuario) {

                alert(
                    "Você precisa estar logado."
                );

                return;
            }


            const dados = {

                tipo: "apoio",

                data:
                    document
                        .getElementById(
                            "dataApoio"
                        )
                        .value,

                rotaId:
                    document
                        .getElementById(
                            "rotaApoio"
                        )
                        .value
                        .trim(),

                valor:
                    Number(
                        document
                            .getElementById(
                                "valorApoio"
                            )
                            .value
                    ),

                driverRealiza:
                    document
                        .getElementById(
                            "driverRealizaApoio"
                        )
                        .value
                        .trim(),

                driverPrecisa:
                    document
                        .getElementById(
                            "driverPrecisaApoio"
                        )
                        .value
                        .trim(),

                quemLiberou:
                    document
                        .getElementById(
                            "quemLiberouApoio"
                        )
                        .value
                        .trim(),

                observacoes:
                    document
                        .getElementById(
                            "obsApoio"
                        )
                        .value
                        .trim(),

                lancadoPor:
                    usuario.email,

                criadoEm:
                    new Date().toISOString()
            };


            try {

                const novaReferencia =
                    push(
                        ref(
                            database,
                            "apoios"
                        )
                    );


                await set(
                    novaReferencia,
                    dados
                );


                document
                    .getElementById(
                        "formApoio"
                    )
                    .reset();


                document.getElementById(
                    "dataApoio"
                ).value = dataHoje();


                const mensagem =
                    document.getElementById(
                        "mensagemApoio"
                    );


                mensagem.style.color =
                    "#16a34a";

                mensagem.textContent =
                    "✅ Apoio de rota registrado com sucesso!";


                atualizarDashboard();


            } catch (erro) {

                console.error(
                    erro
                );


                const mensagem =
                    document.getElementById(
                        "mensagemApoio"
                    );


                mensagem.style.color =
                    "#dc2626";

                mensagem.textContent =
                    "❌ Erro ao salvar o apoio.";
            }

        }
    );



/* =========================
   CARREGAR REGISTROS
========================= */

function carregarRegistros() {

    if (!usuario) {
        return;
    }


    const registros = [];


    const referencias = [

        {
            tipo: "ambulancia",
            referencia: ref(
                database,
                "ambulancias"
            )
        },

        {
            tipo: "transferencia",
            referencia: ref(
                database,
                "transferencias"
            )
        },

        {
            tipo: "apoio",
            referencia: ref(
                database,
                "apoios"
            )
        }

    ];


    let carregados = 0;


    referencias.forEach(
        function(item) {

            onValue(
                item.referencia,
                function(snapshot) {

                    const dados =
                        snapshot.val();


                    registros
                        .filter(
                            r =>
                                r.fonte ===
                                item.tipo
                        )
                        .forEach(
                            () => {}
                        );


                    carregados++;


                    if (dados) {

                        Object.entries(
                            dados
                        ).forEach(
                            ([id, registro]) => {

                                registros.push({

                                    ...registro,

                                    id,

                                    fonte:
                                        item.tipo

                                });

                            }
                        );

                    }


                    if (
                        carregados ===
                        referencias.length
                    ) {

                        todosRegistros =
                            registros.sort(
                                (
                                    a,
                                    b
                                ) => {

                                    const dataA =
                                        a.criadoEm ||
                                        a.data ||
                                        "";

                                    const dataB =
                                        b.criadoEm ||
                                        b.data ||
                                        "";

                                    return dataB.localeCompare(
                                        dataA
                                    );

                                }
                            );


                        aplicarFiltros();

                        atualizarDashboard();

                    }

                },
                {
                    onlyOnce: true
                }
            );

        }
    );

}



/* =========================
   DASHBOARD
========================= */

function atualizarDashboard() {

    const ambulancias =
        todosRegistros.filter(
            registro =>
                registro.tipo ===
                "ambulancia"
        ).length;


    const transferencias =
        todosRegistros.filter(
            registro =>
                registro.tipo ===
                "transferencia"
        ).length;


    const apoios =
        todosRegistros.filter(
            registro =>
                registro.tipo ===
                "apoio"
        ).length;


    document.getElementById(
        "totalAmbulancias"
    ).textContent =
        ambulancias;


    document.getElementById(
        "totalTransferencias"
    ).textContent =
        transferencias;


    document.getElementById(
        "totalApoios"
    ).textContent =
        apoios;

}



/* =========================
   FILTROS
========================= */

document
    .getElementById(
        "filtroData"
    )
    .addEventListener(
        "input",
        aplicarFiltros
    );


document
    .getElementById(
        "filtroRota"
    )
    .addEventListener(
        "input",
        aplicarFiltros
    );


document
    .getElementById(
        "filtroDriver"
    )
    .addEventListener(
        "input",
        aplicarFiltros
    );


document
    .getElementById(
        "filtroTipo"
    )
    .addEventListener(
        "change",
        aplicarFiltros
    );



function aplicarFiltros() {

    const data =
        document
            .getElementById(
                "filtroData"
            )
            .value;


    const rota =
        document
            .getElementById(
                "filtroRota"
            )
            .value
            .trim()
            .toLowerCase();


    const driver =
        document
            .getElementById(
                "filtroDriver"
            )
            .value
            .trim()
            .toLowerCase();


    const tipo =
        document
            .getElementById(
                "filtroTipo"
            )
            .value;


    const filtrados =
        todosRegistros.filter(
            function(registro) {

                const correspondeData =
                    !data ||
                    registro.data === data;


                const correspondeRota =
                    !rota ||
                    String(
                        registro.rotaId || ""
                    )
                    .toLowerCase()
                    .includes(rota);


                const textoDrivers =
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


                const correspondeDriver =
                    !driver ||
                    textoDrivers.includes(
                        driver
                    );


                const correspondeTipo =
                    !tipo ||
                    registro.tipo === tipo;


                return (
                    correspondeData &&
                    correspondeRota &&
                    correspondeDriver &&
                    correspondeTipo
                );

            }
        );


    exibirRegistros(
        filtrados
    );

}



window.limparFiltros = function() {

    document.getElementById(
        "filtroData"
    ).value = "";


    document.getElementById(
        "filtroRota"
    ).value = "";


    document.getElementById(
        "filtroDriver"
    ).value = "";


    document.getElementById(
        "filtroTipo"
    ).value = "";


    aplicarFiltros();

};



/* =========================
   EXIBIR REGISTROS
========================= */

function exibirRegistros(
    registros
) {

    const lista =
        document.getElementById(
            "listaRegistros"
        );


    lista.innerHTML = "";


    if (
        registros.length === 0
    ) {

        lista.innerHTML =
            `<div class="sem-registros">
                Nenhum registro encontrado.
            </div>`;

        return;
    }


    registros.forEach(
        function(registro) {

            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "registro";


            let titulo =
                "";


            let conteudo =
                "";


            if (
                registro.tipo ===
                "ambulancia"
            ) {

                titulo =
                    "🚑 Ambulância";


                conteudo = `

                    <p>
                        <strong>📅 Data:</strong>
                        ${escapar(
                            registro.data
                        )}
                    </p>

                    <p>
                        <strong>🔢 Rota ID:</strong>
                        ${escapar(
                            registro.rotaId
                        )}
                    </p>

                    <p>
                        <strong>🚚 Driver:</strong>
                        ${escapar(
                            registro.driver
                        )}
                    </p>

                    <p>
                        <strong>📍 Cidade:</strong>
                        ${escapar(
                            registro.cidade
                        )}
                    </p>

                    <p>
                        <strong>📦 Pacotes:</strong>
                        ${escapar(
                            registro.pacotes
                        )}
                    </p>

                    <p>
                        <strong>👤 Liberado por:</strong>
                        ${escapar(
                            registro.meliLiberou
                        )}
                    </p>

                    <p>
                        <strong>📝 Motivo:</strong>
                        ${escapar(
                            registro.motivo
                        )}
                    </p>

                `;

            }


            else if (
                registro.tipo ===
                "transferencia"
            ) {

                titulo =
                    "🔄 Transferência";


                conteudo = `

                    <p>
                        <strong>📅 Data:</strong>
                        ${escapar(
                            registro.data
                        )}
                    </p>

                    <p>
                        <strong>🔢 Rota ID:</strong>
                        ${escapar(
                            registro.rotaId
                        )}
                    </p>

                    <p>
                        <strong>🚚 Driver inicial:</strong>
                        ${escapar(
                            registro.driverInicial
                        )}
                    </p>

                    <p>
                        <strong>🚚 Driver substituto:</strong>
                        ${escapar(
                            registro.driverSubstituto
                        )}
                    </p>

                    <p>
                        <strong>📍 Cidade:</strong>
                        ${escapar(
                            registro.cidade
                        )}
                    </p>

                    <p>
                        <strong>👤 Liberado por:</strong>
                        ${escapar(
                            registro.meliLiberou
                        )}
                    </p>

                    <p>
                        <strong>📝 Motivo:</strong>
                        ${escapar(
                            registro.motivo
                        )}
                    </p>

                `;

            }


            else if (
                registro.tipo ===
                "apoio"
            ) {

                titulo =
                    "🚚 Apoio de Rota";


                const valor =
                    Number(
                        registro.valor || 0
                    )
                    .toLocaleString(
                        "pt-BR",
                        {
                            style: "currency",
                            currency: "BRL"
                        }
                    );


                conteudo = `

                    <p>
                        <strong>📅 Data:</strong>
                        ${escapar(
                            registro.data
                        )}
                    </p>

                    <p>
                        <strong>🔢 Rota que recebeu apoio:</strong>
                        ${escapar(
                            registro.rotaId
                        )}
                    </p>

                    <p>
                        <strong>💰 Valor:</strong>
                        ${valor}
                    </p>

                    <p>
                        <strong>🚚 Driver que realizou:</strong>
                        ${escapar(
                            registro.driverRealiza
                        )}
                    </p>

                    <p>
                        <strong>🚚 Driver que precisou:</strong>
                        ${escapar(
                            registro.driverPrecisa
                        )}
                    </p>

                    <p>
                        <strong>👤 Apoio liberado por:</strong>
                        ${escapar(
                            registro.quemLiberou
                        )}
                    </p>

                `;

            }


            const observacao =
                registro.observacoes
                    ? `
                        <div class="registro-observacao">
                            <strong>📝 Observações:</strong>
                            <p>
                                ${escapar(
                                    registro.observacoes
                                )}
                            </p>
                        </div>
                    `
                    : "";


            div.innerHTML = `

                <div class="registro-titulo">

                    <div class="registro-tipo">
                        ${titulo}
                    </div>

                    <button
                        class="botao-excluir"
                        onclick="excluirRegistro(
                            '${registro.fonte}',
                            '${registro.id}'
                        )"
                    >
                        🗑️ Excluir
                    </button>

                </div>


                <div class="registro-info">

                    ${conteudo}

                    <p>
                        <strong>👤 Lançado por:</strong>
                        ${escapar(
                            registro.lancadoPor
                        )}
                    </p>

                </div>

                ${observacao}

            `;


            lista.appendChild(
                div
            );

        }
    );

}



/* =========================
   PROTEÇÃO DE TEXTO
========================= */

function escapar(valor) {

    if (
        valor === null ||
        valor === undefined
    ) {

        return "";

    }


    return String(valor)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}



/* =========================
   EXCLUIR REGISTRO
========================= */

window.excluirRegistro =
    async function(
        tipo,
        id
    ) {

        if (!usuario) {

            alert(
                "Você precisa estar logado."
            );

            return;
        }


        const confirmar =
            confirm(
                "Tem certeza que deseja excluir este registro?"
            );


        if (!confirmar) {
            return;
        }


        try {

            await remove(
                ref(
                    database,
                    `${tipo === "ambulancia"
                        ? "ambulancias"
                        : tipo === "transferencia"
                            ? "transferencias"
                            : "apoios"
                    }/${id}`
                )
            );


            alert(
                "✅ Registro excluído com sucesso."
            );


            carregarRegistros();


        } catch (erro) {

            console.error(
                erro
            );


            alert(
                "❌ Não foi possível excluir o registro."
            );

        }

    };



/* =========================
   ALTERAR SENHA
========================= */

window.abrirAlterarSenha =
    function() {

        document
            .getElementById(
                "modalSenha"
            )
            .classList.remove(
                "escondida"
            );


        document.getElementById(
            "mensagemSenha"
        ).textContent = "";

    };



window.fecharAlterarSenha =
    function() {

        document
            .getElementById(
                "modalSenha"
            )
            .classList.add(
                "escondida"
            );

    };



document
    .getElementById(
        "formAlterarSenha"
    )
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


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

                mensagem.style.color =
                    "#dc2626";

                mensagem.textContent =
                    "❌ As novas senhas não são iguais.";

                return;
            }


            if (
                novaSenha.length < 6
            ) {

                mensagem.style.color =
                    "#dc2626";

                mensagem.textContent =
                    "❌ A nova senha precisa ter pelo menos 6 caracteres.";

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


                mensagem.style.color =
                    "#16a34a";

                mensagem.textContent =
                    "✅ Senha alterada com sucesso!";


                document
                    .getElementById(
                        "formAlterarSenha"
                    )
                    .reset();


            } catch (erro) {

                console.error(
                    "Erro ao alterar senha:",
                    erro
                );


                mensagem.style.color =
                    "#dc2626";


                if (
                    erro.code ===
                    "auth/wrong-password" ||
                    erro.code ===
                    "auth/invalid-credential"
                ) {

                    mensagem.textContent =
                        "❌ A senha atual está incorreta.";

                } else if (
                    erro.code ===
                    "auth/weak-password"
                ) {

                    mensagem.textContent =
                        "❌ A nova senha é muito fraca.";

                } else if (
                    erro.code ===
                    "auth/requires-recent-login"
                ) {

                    mensagem.textContent =
                        "❌ Saia e entre novamente para alterar a senha.";

                } else {

                    mensagem.textContent =
                        "❌ Não foi possível alterar a senha.";
                }

            }

        }
    );



/* =========================
   RECUPERAR SENHA
========================= */

window.abrirRecuperarSenha =
    function() {

        const modal =
            document.getElementById(
                "modalRecuperarSenha"
            );


        modal.classList.remove(
            "escondida"
        );


        const emailLogin =
            document.getElementById(
                "loginEmail"
            )
            .value
            .trim();


        if (emailLogin) {

            document.getElementById(
                "emailRecuperacao"
            ).value =
                emailLogin;

        }


        document.getElementById(
            "mensagemRecuperacao"
        ).textContent = "";

    };



window.fecharRecuperarSenha =
    function() {

        document
            .getElementById(
                "modalRecuperarSenha"
            )
            .classList.add(
                "escondida"
            );

    };



document
    .getElementById(
        "formRecuperarSenha"
    )
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            const email =
                document
                    .getElementById(
                        "emailRecuperacao"
                    )
                    .value
                    .trim();


            const mensagem =
                document.getElementById(
                    "mensagemRecuperacao"
                );


            mensagem.style.color =
                "#2563eb";

            mensagem.textContent =
                "⏳ Enviando e-mail...";


            try {

                await sendPasswordResetEmail(
                    auth,
                    email
                );


                mensagem.style.color =
                    "#16a34a";

                mensagem.textContent =
                    "✅ E-mail enviado! Verifique sua caixa de entrada e também a pasta de spam.";

            } catch (erro) {

                console.error(
                    "Erro ao recuperar senha:",
                    erro
                );


                mensagem.style.color =
                    "#dc2626";


                if (
                    erro.code ===
                    "auth/user-not-found"
                ) {

                    mensagem.textContent =
                        "❌ Não encontramos uma conta com esse e-mail.";

                } else if (
                    erro.code ===
                    "auth/invalid-email"
                ) {

                    mensagem.textContent =
                        "❌ Digite um e-mail válido.";

                } else {

                    mensagem.textContent =
                        "❌ Não foi possível enviar o e-mail de recuperação.";
                }

            }

        }
    );



/* =========================
   FIM
========================= */