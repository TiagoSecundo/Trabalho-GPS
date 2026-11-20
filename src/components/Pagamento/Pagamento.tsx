
import { useState } from 'react'
import './Pagamento.css'

// Métodos disponíveis na simulação
type FormaPagamento = 'pix' | 'cartao'

// Estrutura dos dados recebidos da tela de busca
export type DadosCarona = {
  origem: string
  destino: string
  data: string
  horario: string
  motorista: string
  valorTotal: number
  quantidadePassageiros: number
}

// Propriedades opcionais para facilitar a integração
type PagamentoProps = {
  carona?: DadosCarona
  onVoltar?: () => void
  onConfirmar?: (forma: FormaPagamento) => void
}

// Dados fictícios usados enquanto as telas não estão integradas
const caronaExemplo: DadosCarona = {
  origem: 'Diamantina, MG',
  destino: 'Belo Horizonte, MG',
  data: '25/11/2026',
  horario: '08:00',
  motorista: 'João Silva',
  valorTotal: 120,
  quantidadePassageiros: 3,
}

// Código demonstrativo, que não representa uma cobrança real
const codigoDemonstracao = '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-426614174000520400005303986540510.005802BR5913Fulano de Tal6008BRASILIA62070503***63041D3D'

// Formata valores monetários no padrão brasileiro
function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function Pagamento({
  carona = caronaExemplo,
  onVoltar,
  onConfirmar,
}: PagamentoProps) {
  // Armazena a forma de pagamento selecionada
  const [formaPagamento, setFormaPagamento] =
    useState<FormaPagamento>('pix')

  // Controla a confirmação simulada da reserva
  const [confirmado, setConfirmado] = useState(false)

  // Armazena a mensagem do botão de cópia
  const [mensagemCopia, setMensagemCopia] = useState('')

  // Calcula o valor individual da viagem
  const valorIndividual =
    carona.quantidadePassageiros > 0
      ? carona.valorTotal / carona.quantidadePassageiros
      : 0

  // Altera a forma de pagamento e reinicia a confirmação
  function selecionarPagamento(forma: FormaPagamento) {
    setFormaPagamento(forma)
    setConfirmado(false)
    setMensagemCopia('')
  }

  // Copia apenas um código fictício de demonstração
  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(codigoDemonstracao)
      setMensagemCopia('Copiado!')
    } catch {
      setMensagemCopia('Selecione e copie o código')
    }
  }

  // Simula a confirmação e avisa o componente integrador
  function confirmarReserva() {
    setConfirmado(true)
    onConfirmar?.(formaPagamento)
  }

  return (
    <main className="pg-pagina">
      <div className="pg-container">

        {/* Cabeçalho do sistema */}
        <header className="pg-cabecalho">
          <div className="pg-barra-superior">
            <strong className="pg-marca">Forma</strong>

            {/* O botão aparece quando a navegação for integrada */}
            {onVoltar && (
              <button
                type="button"
                className="pg-voltar"
                onClick={onVoltar}
              >
                ← Voltar
              </button>
            )}
          </div>

          {/* Indicador das etapas da reserva */}
          <nav className="pg-etapas" aria-label="Etapas da reserva">
            <div className="pg-etapa pg-concluida">
              <span>Cadastro</span>
            </div>

         <div className="pg-etapa pg-concluida">
          <span>Busca</span>
        </div>

        <div className="pg-etapa pg-ativa" aria-current="step">
          <span>Pagamento</span>
        </div>
      </nav>

          <div className="pg-introducao">
            <h1>Pagar e reservar</h1>
            <p>
              Escolha como quer pagar e confira os detalhes
              antes de confirmar sua carona.
            </p>
          </div>
        </header>

        {/* Área principal dividida em duas colunas */}
        <div className="pg-grid">

          {/* Coluna esquerda: escolha da forma de pagamento */}
          <section className="pg-card">
            <h2>Forma de pagamento</h2>

            {/* Seleção entre Pix e cartão */}
            <div className="pg-metodos">
              <button
                type="button"
                className={`pg-metodo ${
                  formaPagamento === 'pix' ? 'pg-selecionado' : ''
                }`}
                aria-pressed={formaPagamento === 'pix'}
                onClick={() => selecionarPagamento('pix')}
              >
                <span className="pg-metodo-icone" aria-hidden="true">
                  ◇
                </span>
                <span>
                  <strong>Pix</strong>
                  <small>Instantâneo</small>
                </span>
              </button>

              <button
                type="button"
                className={`pg-metodo ${
                  formaPagamento === 'cartao' ? 'pg-selecionado' : ''
                }`}
                aria-pressed={formaPagamento === 'cartao'}
                onClick={() => selecionarPagamento('cartao')}
              >
                <span className="pg-metodo-icone" aria-hidden="true">
                  ▣
                </span>
                <span>
                  <strong>Cartão</strong>
                  <small>Crédito ou débito</small>
                </span>
              </button>
            </div>

            {/* Conteúdo exibido quando Pix está selecionado */}
            {formaPagamento === 'pix' && (
              <div className="pg-pix-conteudo">
                <div
                  className="pg-qr"
                  role="img"
                  aria-label="QR Code ilustrativo, não escaneável"
                >
                  <span className="pg-qr-canto pg-qr-a" />
                  <span className="pg-qr-canto pg-qr-b" />
                  <span className="pg-qr-canto pg-qr-c" />
                  <span className="pg-qr-demo">QR Code</span>
                </div>

                <div className="pg-pix-instrucoes">
                  <h3>Pagamento via Pix</h3>
                  <p>
                    Exemplo visual de pagamento. O QR Code
                    é ilustrativo e não pode ser utilizado.
                  </p>

                  <div className="pg-copiar-area">
                    <input
                      type="text"
                      readOnly
                      aria-label="Código Pix demonstrativo"
                      value={codigoDemonstracao}
                    />
                    <button
                      type="button"
                      onClick={copiarCodigo}
                    >
                      Copiar
                    </button>
                  </div>

                  <span className="pg-mensagem-copia" role="status">
                    {mensagemCopia}
                  </span>
                </div>
              </div>
            )}

            {/* Conteúdo exibido quando cartão está selecionado */}
            {formaPagamento === 'cartao' && (
              <div className="pg-cartao-conteudo">
                <div className="pg-cartao-ilustracao">
                  <span>CARTÃO BANCO</span>
                  <strong>•••• •••• •••• 1234</strong>
                </div>

                <p>
                  A opção de cartão é apenas uma simulação.
                  Nenhum dado bancário será solicitado.
                </p>
              </div>
            )}

            {/* Informações de segurança do protótipo */}
            <p className="pg-seguranca">
              <span aria-hidden="true">ⓘ</span>
              Ambiente demonstrativo. Não informe dados reais.
            </p>
          </section>

          {/* Coluna direita: resumo da carona */}
          <section className="pg-card">
            <h2>Resumo da carona</h2>

            {/* Linha vertical representando origem e destino */}
            <div className="pg-trajeto">
              <div className="pg-local">
                <span className="pg-ponto pg-origem" aria-hidden="true" />
                <div>
                  <small>Saída · {carona.horario}</small>
                  <strong>{carona.origem}</strong>
                </div>
              </div>

              <div className="pg-local">
                <span className="pg-ponto pg-destino" aria-hidden="true" />
                <div>
                  <small>Chegada</small>
                  <strong>{carona.destino}</strong>
                </div>
              </div>
            </div>

            {/* Data e motorista */}
            <div className="pg-detalhes">
              <div>
                <span>Data</span>
                <strong>{carona.data}</strong>
              </div>

              <div>
                <span>Motorista</span>
                <strong>{carona.motorista}</strong>
              </div>
            </div>

            {/* Divisão dos custos */}
            <div className="pg-custos">
              <div>
                <span>Valor total da viagem</span>
                <strong>
                  {formatarMoeda(carona.valorTotal)}
                </strong>
              </div>

              <div>
                <span>Dividido entre passageiros</span>
                <strong>
                  {carona.quantidadePassageiros}
                </strong>
              </div>
            </div>

            {/* Valor individual destacado */}
            <div className="pg-total">
              <span>Você paga</span>
              <strong>{formatarMoeda(valorIndividual)}</strong>
            </div>

            {/* Confirmação fictícia da reserva */}
            <button
              type="button"
              className="pg-confirmar"
              disabled={confirmado || carona.quantidadePassageiros <= 0}
              onClick={confirmarReserva}
            >
              {confirmado
                ? 'Reserva simulada confirmada ✓'
                : `Confirmar reserva · ${formatarMoeda(valorIndividual)}`}
            </button>

            {/* Feedback apresentado após a confirmação */}
            {confirmado && (
              <div className="pg-sucesso" role="status">
                ✓ Reserva confirmada!
              </div>
            )}
            
            {/* Aviso sobre o protótipo */}
            <p className="pg-aviso">
              Protótipo acadêmico. Nenhum pagamento real será feito.
            </p>
          </section>

        </div> {/* Fecha pg-grid, que contém os dois cartões */}

        {/* Rodapé centralizado abaixo dos cartões */}
        <footer className="pg-rodape">
          <p>© 2026 Forma. Projeto acadêmico - UFVJM.</p>
        </footer>

      </div> {/* Fecha pg-container */}
    </main>
  )
}

export default Pagamento

