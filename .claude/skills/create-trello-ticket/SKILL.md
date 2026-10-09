---
name: create-trello-ticket
description: Create, update or move a ticket on the eCenovnik.app Trello board in the team's format. Use whenever the user asks for a ticket, a follow-up task, a bug report or a card on Trello (the user may say Jira), or when a decision or bug found during work should be written down as a ticket.
---

# Create a Trello ticket

Tickets live on the Trello board **eCenovnik.app**. Write them so someone who was not in this conversation can act on them.

## 1. Load the tools

The Trello tools are deferred; load them in one call first:

`ToolSearch` with `select:mcp__db507f81-2f57-4880-b81e-78b7938a2876__trelloWriteCard,mcp__db507f81-2f57-4880-b81e-78b7938a2876__trelloReadCard,mcp__db507f81-2f57-4880-b81e-78b7938a2876__trelloSearch,mcp__db507f81-2f57-4880-b81e-78b7938a2876__trelloReadList`

## 2. Board facts

- Board: `ari:cloud:trello::board/workspace/69a192ecf725e03d8147432b/69a19340031bb095525ca73f`
- Lists (ARI prefix `ari:cloud:trello::list/workspace/69a192ecf725e03d8147432b/`):

| List | Id suffix | Use for |
|---|---|---|
| To Do | `69a19340031bb095525ca73b` | the default |
| In Progress | `69a19340031bb095525ca73c` | only when the user says we start now or shortly |
| Next Release | `6a833a51cb46479bb51be4c0` | agreed for the next release |
| Bugs | `6aba20c42981e7e5e221e094` | defects users can see |
| Questions For Next Meeting | `69a19340031bb095525ca73a` | open decisions and discussion points |
| Long term (ongoing) | `6a833a3bf99ecd02d4819282` | ongoing, no end date |
| In Review / Blocked / Done | `69ecf18c80bd82db104dface` / `69a19340031bb095525ca73d` / `69a19340031bb095525ca73e` | move only when asked |

- Owner: `marjanskid` (`ari:cloud:trello::user/5a7a4138615d4f0f8148fdbf`), timezone Europe/Belgrade.

## 3. Before creating

1. Search for a duplicate (`trelloSearch` with two or three keywords). If one exists, update it or link to it instead.
2. Check the facts you are about to write against the code or the data; never describe a bug you have not verified. Say what you did not check.
3. Decide the list: To Do unless the user named another. A decision that needs discussion goes to Questions For Next Meeting.

## 4. Write it

Tickets are written in **Serbian**, in the voice of a software engineer: direct, no filler, no step-by-step instructions and no long explanations. Technical terms, file names and function names stay as they are in code.

- **Title**: Serbian, specific, about 70 characters or less. Prefix `Web:` or `Mobile:` when it is for one platform. Say the outcome, not the activity ("Escape-ovati LIKE wildcard-e u pretrazi", not "Pogledati pretragu").
- **Description**: first line `Owner: marjanskid` (this tool cannot assign members; the user can press Space over the card to add themselves). Then exactly three short parts:
  1. **Problem**: what is wrong or missing and who it affects, with the file or function if known. Say honestly how serious it is, including when users do not notice it.
  2. **Šta želimo**: what we want to do differently, in one to three sentences.
  3. **Očekivani ishod**: the result someone can check.
- **Length**: a few sentences per part, no more. Do not paste long SQL or code; name the file instead. Link related tickets by number and absolute dates ("2026-10-09"), never "today".
- **Check the facts** against the code or data before writing; say what was not verified. Never describe a bug you have not confirmed.
- **Never include** secrets, keys, tokens, email addresses or customer data. Test account ids only when needed to reproduce.

Example:

> Owner: marjanskid
>
> **Problem**: `getOrCreateList` u `services/shoppingLists.ts` pravi listu ako je nema, pa dva istovremena poziva za novog korisnika naprave dve liste. Korisnici to ne primećuju na mobilnom, ali web puca kad nalog ima više od jedne liste.
>
> **Šta želimo**: da mobilna aplikacija samo čita listu, a da je pravi baza pri registraciji (#132).
>
> **Očekivani ishod**: mobilna aplikacija nikad ne radi insert u `shopping_lists`, a web i mobilna prikazuju istu listu za isti nalog.

## 5. After creating

- Reply with each card's title and link, and the list it went to.
- Offer to move it if the list may be wrong.
- To change a card use `update` (name or desc; it replaces the description, so read the card first and keep what is still true) or `move`. Write calls need the card ARI from the create or read result, not the URL. Never archive, delete or mark a card done unless asked.
