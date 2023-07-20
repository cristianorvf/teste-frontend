/* eslint-disable testing-library/no-wait-for-multiple-assertions */
/* eslint-disable testing-library/no-unnecessary-act */
/* eslint-disable testing-library/prefer-screen-queries */
import {
  act,
  screen,
  fireEvent,
  render,
  waitFor,
} from "@testing-library/react"
import DataList from "../components/DataList"
import Button from "../components/Button"
import Small from "../components/Small"
import DataListUsers from "../components/DataListUsers"
import { unmountComponentAtNode } from "react-dom"
import db from "../../db.json"

let container: HTMLDivElement | any = null

describe("Component Button", () => {
  it("renderiza o botão corretamente.", () => {
    const { getByTestId } = render(<Button onClick={() => {}}>Click me</Button>)
  
    const buttonElement = getByTestId("button")
    expect(buttonElement).toBeInTheDocument()
  })
  
  it("chama o evento onClick quando o botão é clicado", () => {
    const onClickMock = jest.fn()
    const { getByTestId, getByText } = render(
      <Button onClick={onClickMock}>Click me</Button>
    )
  
    const buttonElement = getByTestId("button")
    fireEvent.click(buttonElement)
  
    expect(onClickMock).toHaveBeenCalledTimes(1)
    expect(getByText("Click me")).toBeInTheDocument()
  })
})

describe("Listagem e Ciclo de vida", () => {
  it("renderiza a lista de dados corretamente", () => {
    const data = ["Item 1", "Item 2", "Item 3"]
    const { getByText } = render(<DataList data={data} />)
  
    data.forEach((item) => {
      const itemElement = getByText(item)
      expect(itemElement).toBeInTheDocument()
    })
  })
  
  beforeEach(() => {
    container = document.createElement("div")
    document.body.appendChild(container)
  })
  
  afterEach(() => {
    if (container) {
      unmountComponentAtNode(container)
      container.remove()
      container = null
    }
  })

  it("validando com um console.log se foi chamado cada ciclo de vida do componente", () => {
    const consoleSpy = jest.spyOn(console, "log")
    consoleSpy.mockImplementation(() => {})
  
    act(() => {
      render(<Small message="Testing lifecycle" />, container)
    })
    expect(consoleSpy).toHaveBeenCalledWith("Component did mount")
  
    act(() => {
      render(<Small message="Updated message" />, container)
    })
    expect(consoleSpy).toHaveBeenCalledWith("Component did update")
  
    act(() => {
      unmountComponentAtNode(container!)
    })
  
    consoleSpy.mockRestore()
  })
})

describe("validando request utilizando fetch", () => {
  it("validando mensagem de Loading ao inicializar o componente", () => {
    render(<DataListUsers />)
    expect(screen.getByText("Loading...")).toBeInTheDocument()
  })

  it("validando listagem de nomes carregados no component", async () => {
    const dataMock = db.users

    jest.spyOn(window, "fetch").mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce(dataMock),
    } as unknown as Response)

    render(<DataListUsers />)

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).toBeNull()

      dataMock.forEach((user) => {
        const itemElement = screen.getByText(user.name)
        expect(itemElement).toBeInTheDocument()
      })
    })
  })
})
