# importância

- Manter a confiabilidade de que seu código irá funcionar
- Saber se vai quebrar o código após o código


# exemplos
- sex 17hrs vc atualiza algo no código... 3 semanas depois, o cliente reclama que uma funcionalidade lá no fundo do ngc que tu nem mexou parou de funcionar. - Isso é FALTA de testes automatizados

# tipos de teste / pirâmides de testes etc.

- Unitários: Testar uma unidade da sua aplicação (pequena parte totalmente isolada)
 
- Integração: Comunicação entre duas ou mais unidades; Testar integração (testar função que testa função que é chamada)

- e2e - end to end (ponta a ponta): Simulando um usuário operando na aplicação

## front end
- testes end to end... Imagina uma funcionalidade de login. Ele abre a página de login, a gente fala pra digitar o texto "diego@contabilizeae.com.br" no campo com ID email, clique no botão.
## back end
- chamadas HTTP, websockets...
- não temos a interface pro usuário
- o usuário do backend é o front end
- pode fazer chamadas HTTP
- a gente vai testar as camadas que estão expostas ao mundo externo, que são as que se comunicam com o front end da nossa app.
-  end to end seria desde a rota, até o banco de dados, TUDO!

# testes que iremos usar:

## estudo piramide de testes:
- explica a importancia de cada tipo de teste e qual fazer primeiro.
- cada teste tem uma dificuldade e exigencia pra fazer na app
- melhor para começar: end to end. (não dependem de nenhuma tecnologia, nenhuma arquitetura de testes)

## prq não usar só testes e2e:
- como eles simulam o usuário final, fazem a chamada, batem no bd e tals... ELE SÃO EXTREMAMENTE LENTOS!
- 500ms de teste em uma aplicação com 500 testes == 16 minutos
  

	# programa Vitest

	- mesmo criador do vue
	- framework de 
	- esbuild
	- TSX
	- JSX
	- vite
	- instalação rápida
	-   