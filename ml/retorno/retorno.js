// Pagina de retorno do OAuth do Mercado Livre (aplicativo unico da Falcs).
// Nao grava nada: so devolve o navegador para a instalacao que pediu a autorizacao.
// O destino vem no "state", montado pela propria instalacao: {"u": "<url de retorno>", "n": "<nonce>"}.
// So aceita destino cujo caminho termine no retorno do ERPWEB: assim a pagina nao vira um
// redirecionador aberto. O codigo sozinho nao serve para nada sem o PKCE, que fica na instalacao.
(function () {
  var CAMINHO_RETORNO = '/ecommerce/ml/retorno';

  function falhar(msg) {
    document.getElementById('titulo').textContent = 'Não foi possível concluir a conexão';
    var p = document.getElementById('texto');
    p.textContent = msg;
    p.className = 'erro';
  }

  var q = new URLSearchParams(window.location.search);
  var state = q.get('state');
  if (!state) { falhar('Endereço incompleto. Volte ao sistema e clique em "Conectar" de novo.'); return; }

  var destino;
  try {
    var b64 = state.replace(/-/g, '+').replace(/_/g, '/');
    while (b64.length % 4) b64 += '=';
    destino = new URL(JSON.parse(atob(b64)).u);
  } catch (e) {
    falhar('Endereço inválido. Volte ao sistema e clique em "Conectar" de novo.'); return;
  }

  var caminho = destino.pathname.replace(/\/+$/, '');
  if ((destino.protocol !== 'http:' && destino.protocol !== 'https:') ||
      destino.username || destino.password ||
      caminho.slice(-CAMINHO_RETORNO.length) !== CAMINHO_RETORNO) {
    falhar('Destino não reconhecido. Volte ao sistema e clique em "Conectar" de novo.'); return;
  }

  // Repassa o que o Mercado Livre devolveu: o codigo, ou o erro (ex.: usuario recusou).
  var repassar = ['code', 'state', 'error', 'error_description'];
  destino.search = '';
  repassar.forEach(function (k) { if (q.get(k) !== null) destino.searchParams.set(k, q.get(k)); });

  window.location.replace(destino.toString());
})();
