describe('Rutas protegidas y roles', () => {
  it('sin sesión, una ruta protegida redirige a /login', () => {
    cy.visit('/app/home');
    cy.url().should('include', '/login');
  });

  it('el paciente inicia sesión y llega a /app/home', () => {
    cy.visit('/login');
    cy.get('ion-input input[type=email]').type('paciente@demo.cl');
    cy.get('ion-input input[type=password]').type('Paciente123');
    cy.get('ion-button[type=submit]').click();
    cy.url().should('include', '/app/home');
    cy.contains('Continúa donde lo dejaste');
  });

  it('un paciente que entra a /admin es enviado a /unauthorized', () => {
    cy.visit('/login');
    cy.get('ion-input input[type=email]').type('paciente@demo.cl');
    cy.get('ion-input input[type=password]').type('Paciente123');
    cy.get('ion-button[type=submit]').click();
    cy.url().should('include', '/app/home');
    cy.visit('/admin');
    cy.url().should('include', '/unauthorized');
  });
});
