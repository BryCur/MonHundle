// The daily challenge's recovery path (DailyGameService catching a 409 and silently resuming the
// existing game) is the most complex piece of logic on the frontend - covered thoroughly at the
// unit level, but never exercised in a real browser until now.

describe('Daily challenge', () => {
    it('starts a fresh daily game on first visit', () => {
        cy.startDailyGame();

        cy.get('.monster-select-toggle').should('exist');
        cy.get('.option-game-over-container').should('not.exist');
    });

    it('transparently resumes the existing game when one was already started today', () => {
        cy.intercept('POST', '**/game/daily/start', {
            statusCode: 409,
            body: JSON.stringify('existing-daily-game'),
        }).as('startDaily');
        cy.intercept('GET', '**/game/daily/resume/existing-daily-game', {
            statusCode: 200,
            body: {
                gameId: 'existing-daily-game',
                gameMode: 1, // GameModes.Daily
                state: 0, // GameStates.Ongoing
                guesses: [],
            },
        }).as('resumeDaily');
        cy.mockMonsterChoices();

        cy.visit('/daily');
        cy.wait('@authUser');
        cy.wait('@startDaily');
        cy.wait('@resumeDaily');
        cy.wait('@monsterChoices');

        // the 409/recovery round-trip is invisible to the player: they land on a normal,
        // playable game rather than seeing an error.
        cy.get('.monster-select-toggle').should('exist');
        cy.get('.option-game-over-container').should('not.exist');
    });

    it('shows the game-over screen when resuming a challenge already finished today', () => {
        // DailyGameService.resumeGame() reports success as soon as a game is found, regardless of
        // its state - unlike UnlimitedGameService, which only counts it as resumed while ongoing.
        // That's intentional: a daily challenge is one attempt per day, so a finished one should stay
        // finished on reload rather than silently starting a new attempt like Unlimited does.
        cy.setCookie('currentDailyGame', 'finished-daily-game');

        cy.intercept('GET', '**/game/daily/resume/finished-daily-game', {
            statusCode: 200,
            body: {
                gameId: 'finished-daily-game',
                gameMode: 1, // GameModes.Daily
                state: 1, // GameStates.Win
                guesses: [],
            },
        }).as('resumeDaily');
        cy.mockMonsterChoices();

        cy.visit('/daily');
        cy.wait('@authUser');
        cy.wait('@resumeDaily');
        cy.wait('@monsterChoices');

        cy.get('.option-game-over-container').should('exist');
        cy.get('.option-selector-container').should('not.exist');
    });
});
