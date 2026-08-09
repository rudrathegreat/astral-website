# SNR Calculator upgrade plan

## Purpose

Upgrade the existing calculator into a small, reliable static application that can:

1. prefill instrument values from named telescope/receiver configurations;
2. find a pulsar and prefill the pulsar values needed by the radiometer equation;
3. allow local customisation of telescope presets; and
4. remain deployable on GitHub Pages with no server, build step, account, or API key.

The deployed implementation will contain only:

```text
tools/snrcalc/
|-- index.html
|-- style.css
`-- app.js
```

Existing site-wide images, navigation, or fonts may still be referenced from `../../assets` if desired, but all calculator-specific markup, styling, logic, and data will live in these three files.

## Confirmed product decisions

The following decisions were confirmed on 2026-08-05:

- "Logged telescope data" means **telescope presets**, not an observation/calculation history.
- Version 1 will include **MeerKAT, Parkes/Murriyang, FAST, and CHIME**. Each receiver/band must be represented as a separate configuration where its sensitivity values differ.
- **Every entry in the selected ATNF catalogue release** must be searchable, including entries with missing period, width, or flux values.
- Pulsar data will be a **dated catalogue snapshot**, not a live API dependency.
- If a suitable catalogue flux is unavailable, the visitor must **enter the flux manually**. Version 1 will not extrapolate flux with a spectral index.
- Custom telescope presets and preferences will be **local to the visitor's browser/device**. There will be no cloud sync or shared database.
- The **existing radiometer equation remains unchanged**. Version 1 will not add `beta`, sky temperature, elevation-dependent gain, or other correction factors.

Because GitHub Pages has no database, custom telescope configurations will use `localStorage`. They will not sync between users or computers. Built-in telescope and pulsar data will be embedded in `app.js` so it is identical for every visitor.

The first release will use a complete, versioned ATNF catalogue snapshot embedded in `app.js`, rather than making the calculator depend on a live third-party request. This keeps the application static and avoids CORS, outage, rate-limit, and API-format risks. The intended source is the [ATNF Pulsar Catalogue](https://www.atnf.csiro.au/research/pulsar/psrcat/), which exposes the relevant `P0`, `W50`, `S400`, `S1400`, and `S2000` parameters. Its [download page](https://www.atnf.csiro.au/research/pulsar/psrcat/download.html) provides the public catalogue, and its requested acknowledgement and applicable reuse terms must be checked before catalogue data is committed.

## Hard design and scope constraints

These requirements are mandatory:

1. **Preserve the calculator's current visual language.** Existing input elements, labels, result treatment, button treatment, typography, borders, focus colour, colour palette, and overall tone are the visual baseline. In particular, the current transparent inputs, black borders, Space Mono typography, uppercase treatment, and purple focus/accent state must not be redesigned. New controls such as telescope and pulsar selectors must look like natural extensions of those existing controls.
2. **The layout and user journey may change, but must stay simple.** Reflowing, regrouping, progressive disclosure, and a clearer order of operations are allowed when they reduce effort or confusion. Do not add dashboards, multi-page flows, modal-heavy interactions, or unnecessary advanced modes.
3. **Copy the established site navigation integration directly from the other webpages.** Use the same navigation placeholder/markup, classes, shared stylesheet, assets, and shared scripts used by current pages such as `tools.html`, with only the relative path prefixes changed for `tools/snrcalc/`. Do not create a calculator-specific navigation design or fork the navigation implementation.
4. **All new design decisions must match the rest of the ASTRAL website.** Reuse the site's established typography, spacing character, colours, borders, interaction patterns, and motion conventions. Where this plan does not specify a visual choice, an existing production page is the reference rather than a new standalone design system.
5. **Do not change any other part of the website.** Implementation edits are restricted to `tools/snrcalc/index.html`, `tools/snrcalc/style.css`, and `tools/snrcalc/app.js`; planning edits remain in this `PLAN.md`. Do not modify shared CSS, shared JavaScript, navigation code, root pages, assets, or any other tool/page. Existing shared files may only be referenced read-only.

## Goals

- Make the normal path three choices/actions: select telescope, select pulsar, enter observing time, then calculate.
- Keep every prefilled number editable so the calculator is still usable for unlisted instruments and sources.
- Include every pulsar record from the chosen dated ATNF release in lookup results.
- Preserve manual calculation mode and the current radiometer-equation behaviour unless a scientific change is explicitly approved.
- Show units, source/provenance, catalogue version, and warnings near the values they describe.
- Validate all inputs and never display `NaN`, `Infinity`, or a plausible-looking result from invalid data.
- Work with keyboard, touch, and narrow screens.
- Work at a nested GitHub Pages path without server-side routing.
- Preserve the current calculator control styling while simplifying the layout and workflow.
- Integrate with the exact navigation pattern and broader design language already used by the website.

## Non-goals for the first release

- User accounts, cloud sync, shared logs, or a central observation database.
- Calculation/observation history and result logging.
- Uploading or processing raw telescope data, filterbanks, archives, or PSRFITS files.
- Automatically deriving telescope sensitivity from time-, elevation-, weather-, beam-, or receiver-dependent conditions.
- Silently estimating missing pulsar flux or width values.
- A framework, package manager, bundler, service worker, or separate JSON/database file.
- Any visual redesign of the existing calculator controls or the global navigation.
- Any modification outside the `tools/snrcalc` files named in the hard scope constraint.

## User experience

### 1. Choose a telescope configuration

- Provide a searchable/selectable telescope control.
- Style the selector and its states to match the current calculator inputs exactly; it must not resemble a separate component library.
- If a telescope has several receiver/band configurations, make the band part of the selection; a telescope does not have one universal bandwidth, gain, or system temperature.
- Selecting a configuration fills:
  - collecting area (m^2);
  - aperture efficiency (%);
  - centre/reference frequency (MHz);
  - usable bandwidth (MHz);
  - system temperature (K);
  - number of summed polarisations;
  - configuration source and date last verified.
- Keep the filled fields editable and visibly mark edited values as overrides.
- Offer "Save as custom telescope" and "Reset to published values".

### 2. Choose a pulsar

- Search by J name or B name with a native, keyboard-accessible suggestion list.
- Style search, suggestions, and resolved/manual fields as extensions of the existing calculator form.
- Selecting a pulsar fills:
  - period `P0` (seconds);
  - pulse width `W50` (catalogue milliseconds converted to seconds for the equation);
  - available catalogue flux measurements, retaining their measurement frequencies and converting mJy to Jy for the equation;
  - pulsar/catalogue provenance.
- The UI must show which flux measurement is being used. It must not relabel a 1400 MHz flux as though it were measured at the selected receiver's frequency.
- If the period, width, or a suitable flux is missing, leave that field unresolved, explain why, and require a manual value before calculating.
- Keep "Manual/unlisted pulsar" as an option.

### 3. Calculate

- The visitor enters observing/integration time and reviews any overrides.
- "Calculate" validates the complete resolved input set.
- Display:
  - S/N with sensible significant figures;
  - the telescope configuration and pulsar name;
  - the exact flux frequency used;
  - a compact input summary;
  - warnings for manual overrides or a telescope/flux frequency mismatch.
- Results are intentionally session-only in version 1; there is no calculation-history or "Save result" feature.

## Scientific calculation contract

Continue using the pulsed radiometer equation represented by the current tool:

```text
G = (eta * A / (2 * k_B)) * 10^-26

S/N = (S * G / Tsys)
      * sqrt(npol * time * bandwidth_hz)
      * sqrt((period - width) / width)
```

Where:

- `A` is physical collecting area in m^2;
- `eta` is aperture efficiency as a fraction, not a percentage;
- `k_B` is exactly `1.380649e-23 J K^-1`;
- `G` is telescope gain in K/Jy;
- `S` is mean flux density in Jy;
- `Tsys` is system temperature in K;
- bandwidth is converted from MHz to Hz;
- time, period, and width are in seconds;
- `npol` is normally 1 or 2; and
- `0 < width < period` is mandatory.

Implementation rules:

- Store/display source values in their published units and perform conversions in named functions. Do not scatter factors such as `1000` or `1e6` through event handlers.
- Calculate with full JavaScript number precision and round only for display.
- Require finite, positive values for all physical inputs; require efficiency in `(0, 100]`; require `npol` to be an allowed integer; and reject `width >= period`.
- Treat catalogue nulls as missing, never as zero.
- Do not silently extrapolate flux between frequencies in the first release. If spectral-index scaling is later approved, show the original measurement, spectral index, target frequency, and derived value, and label the result as estimated.
- Do not add a degradation factor `beta`, sky temperature, or other corrections in version 1; preserve the existing equation as confirmed.

## Data design in `app.js`

Use plain objects/arrays with stable identifiers. Example shapes (illustrative values only):

```js
const BUILT_IN_TELESCOPES = [
  {
    id: "telescope-receiver-band",
    telescopeName: "...",
    configurationName: "...",
    collectingAreaM2: null,
    efficiencyPercent: null,
    centreFrequencyMHz: null,
    bandwidthMHz: null,
    systemTemperatureK: null,
    polarisations: 2,
    sourceUrl: "...",
    lastVerified: "YYYY-MM-DD",
    notes: "..."
  }
];

const PULSAR_CATALOGUE = {
  source: "ATNF Pulsar Catalogue",
  version: "record the imported version",
  retrievedOn: "YYYY-MM-DD",
  entries: [
    {
      jName: "...",
      bName: "...",
      periodSeconds: null,
      width50Milliseconds: null,
      fluxMilliJy: { "400": null, "1400": null, "2000": null }
    }
  ]
};
```

Catalogue inclusion rule: include every pulsar record from the chosen ATNF release, even if `P0`, `W50`, or every supported flux field is missing. Retain only the identifiers and fields needed by the UI/equation to limit file size, but do not remove an entry merely because it cannot produce a complete automatic calculation. Missing values remain `null` and the visitor must manually supply them. Document the exact extraction rule, total imported record count, catalogue version, snapshot date, and acknowledgement in an in-app "Data sources" disclosure.

Before embedding any catalogue snapshot, confirm ATNF/CSIRO's terms permit redistribution in this form. If they do not, use one of these fallbacks:

1. ship a small, explicitly permitted list supplied by ASTRAL;
2. let users paste/manual-enter pulsar values; or
3. use a documented browser-accessible API only after a CORS and availability spike.

Do not make an undocumented scrape of the ATNF web form a production dependency.

## Browser storage

Use versioned keys so future changes can be migrated safely:

```text
snrcalc:v1:custom-telescopes
snrcalc:v1:preferences
```

Storage rules:

- Wrap JSON parsing in error handling and recover gracefully from malformed/old data.
- Assign records UUIDs when available, with a simple collision-resistant fallback.
- Store only custom telescope presets and small UI preferences; calculated results are not persisted.
- Put a reasonable maximum on custom presets and tell the user if storage is unavailable/full.
- Explain in the UI that clearing browser data removes custom presets and preferences.
- Never store personal information.

## Responsibilities by file

### `index.html`

- Semantic page structure, labels, units, help text, result/status regions, and data-source disclosure.
- Calculator form submission through a real `<form>` and `<button type="submit">`; no inline `onclick` handlers.
- Load `./style.css` and `./app.js` using relative URLs (`defer` for the script).
- Copy the same site-navigation integration used by `tools.html` and the other current pages: the `data-site-nav` placeholder plus the existing shared navigation stylesheet/scripts and assets, adjusted only for the nested relative path.
- Do not introduce different navigation markup, labels, behaviour, or calculator-specific navigation code.

### `style.css`

- All calculator-specific styles, migrated from the existing `assets/css/tools/snrcalc.css` without changing the established appearance of inputs, labels, result text, buttons, typography, borders, focus colour, or palette.
- Layout CSS may be reorganised and made responsive, but new styling must reuse patterns from the current calculator and the rest of the ASTRAL site.
- Responsive layout that scrolls normally on short/narrow displays; remove the current fixed `100vh`/hidden vertical overflow behaviour.
- Clear focus, error, warning, override, selected, and disabled states.
- Respect `prefers-reduced-motion`.

### `app.js`

- Built-in telescope configurations and compact pulsar snapshot.
- Pure unit-conversion, validation, and S/N functions.
- State and DOM rendering/event wiring.
- Telescope/pulsar search and field-prefill logic.
- Custom telescope and preference persistence.
- No framework and no third-party runtime dependency.

Keep the numerical core independent of the DOM so it can be tested directly in the browser console or with a temporary local test harness without changing the deployed architecture.

## Implementation sequence

### Phase 0: resolve configuration details and data ownership

- Confirm the initial receiver/band configuration(s) for MeerKAT, Parkes/Murriyang, FAST, and CHIME, then obtain authoritative source URLs for every preset value.
- Confirm pulsar catalogue reuse/acknowledgement requirements.
- Have a domain expert confirm that the unchanged equation and manual-missing-flux policy are appropriate for release.

### Phase 1: establish a clean three-file baseline

- Create `style.css` and `app.js` next to `index.html`.
- Move the inline calculation script into `app.js` and copy the calculator-specific stylesheet into `style.css` as the visual baseline.
- Copy the current site-navigation integration from `tools.html`/other production pages, changing only the relative path prefixes required by the nested calculator location.
- Replace the link-styled calculate control with an accessible form/button.
- Preserve the current visual appearance when changing the control to semantic button markup.
- Preserve current manual-input output for equivalent valid inputs.
- Add validation and inline error/status handling.
- Confirm through `git diff` that no file outside `tools/snrcalc/` has changed.

### Phase 2: telescope configurations

- Add the configuration data model and initial verified records.
- Build telescope/band selection and editable prefill behaviour.
- Implement custom telescope save/reset/delete using `localStorage`.
- Surface sources, verification dates, and overrides.
- Match all new selector, override, save, and reset states to existing ASTRAL and calculator control patterns.

### Phase 3: pulsar lookup

- Produce the approved compact snapshot and paste it into `app.js`.
- Add fast lookup by J/B name without rendering thousands of DOM options at once.
- Confirm that the number of imported/searchable entries exactly matches the selected ATNF snapshot after applying no record-level exclusions.
- Populate period, width, and available fluxes with explicit unit conversion.
- Add missing-data and frequency-mismatch states.
- Include catalogue version, source link, acknowledgement, and snapshot date.

### Phase 4: verification and release

- Run the test matrix below in current Chrome, Firefox, Safari/WebKit, and a mobile-sized viewport.
- Serve the repository locally from its root so relative paths match GitHub Pages.
- Verify the calculator from the actual nested GitHub Pages URL after deployment.
- Ask a pulsar astronomer to review at least three real telescope/pulsar cases before treating results as research-ready.
- Compare the updated page side by side with the current calculator and at least one current top-level ASTRAL page to verify visual continuity.
- Verify the final diff contains changes only inside `tools/snrcalc/`.

## Test and acceptance matrix

### Numerical tests

- A fixed manual-input case matches an independently calculated reference value.
- A simple sanity case (`A=1 m^2`, `eta=100%`, `B=1 MHz`, `S=1 Jy`, `t=1 s`, `Tsys=1 K`, `npol=1`, `P=2 s`, `W=1 s`) returns approximately `0.3622`.
- Catalogue mJy-to-Jy and W50 ms-to-s conversions are correct.
- Manual mode and preset mode return identical results when resolved inputs are identical.
- Editing one prefilled field changes the result and records the override.

### Validation tests

- Empty, non-numeric, zero, negative, and infinite values are rejected.
- Efficiency above 100%, invalid polarisation counts, and `width >= period` are rejected.
- Missing catalogue values remain visibly missing and block calculation until supplied.
- Calculation results remain session-only and are not written to browser storage.

### Data and persistence tests

- Searching either J name or B name selects the expected pulsar.
- The imported entry count matches the chosen complete ATNF snapshot, and records with missing S/N fields remain searchable.
- Selecting a different receiver configuration updates all instrument fields.
- Reloading preserves custom telescope presets and preferences.
- Corrupt or unavailable `localStorage` shows a warning but does not break calculation.
- Deleting a custom preset does not affect built-in presets or the current manual-calculation path.

### UI, accessibility, and deployment tests

- Every input has a programmatic label and visible unit.
- All actions work by keyboard with a visible focus indicator.
- Errors and the calculated result are announced through an appropriate live region.
- The page scrolls and remains usable at 320 CSS pixels wide and at 200% zoom.
- Reduced-motion mode has no required animation.
- There are no console errors or failed calculator asset requests on GitHub Pages.
- No API key, server process, build artefact, or root-relative deployment assumption is required.
- Existing input, label, result, button, typography, border, focus, and colour treatments remain visually unchanged.
- Newly added telescope/pulsar controls look and behave consistently with the preserved calculator controls.
- The navigation markup/integration, links, open/close behaviour, styling, and responsive behaviour match the other website pages.
- The simplified user journey does not require more than telescope selection, pulsar selection, observing time entry, and calculation for the standard complete-data case.
- `git diff --name-only` contains no implementation changes outside `tools/snrcalc/index.html`, `tools/snrcalc/style.css`, and `tools/snrcalc/app.js` (plus this plan during planning).

## Definition of done

- `tools/snrcalc` contains the three agreed deployed files plus this planning document during development.
- A user can calculate manually, from a telescope preset, from a pulsar preset, or from both.
- MeerKAT, Parkes/Murriyang, FAST, and CHIME have verified receiver/band presets.
- Every entry from the selected dated ATNF release is searchable.
- Every built-in telescope value and pulsar snapshot has visible provenance.
- Missing or frequency-inappropriate catalogue data cannot silently produce an S/N.
- Custom telescope presets persist locally; calculated results do not.
- The numerical and validation test matrix passes.
- The tool is usable on mobile and by keyboard.
- The existing calculator visual treatment is preserved even where the layout/user journey has changed.
- The navigation is directly based on the same shared integration as the rest of the website.
- No file outside `tools/snrcalc/` was modified.
- The production GitHub Pages URL works with no backend or secrets.

## Remaining implementation details

The main product choices are now settled. These lower-level details still need confirmation or domain validation during Phase 0:

1. **Which receiver/band configuration(s) should represent each telescope?** MeerKAT, Parkes/Murriyang, and FAST each have multiple possible observing setups. For every included configuration, record authoritative area/efficiency, centre frequency, usable bandwidth, `Tsys`, and polarisation values. CHIME should likewise have an explicitly sourced configuration rather than values inferred from its name alone.
2. **Should `W50` be the standard width everywhere, and may users substitute another published/manual width?** Working assumption: prefill `W50`, label any manual replacement clearly, and calculate with exactly the displayed value.
3. **Which current production page should be the final visual/navigation comparison reference?** Working assumption: use `tools.html` for the navigation integration and the existing SNR calculator for form-control appearance, while using other current ASTRAL pages only to resolve new states that the calculator does not yet have.

## Risks and mitigations

- **Instrument presets look more authoritative than they are.** Store each receiver/band separately, cite sources, date values, allow overrides, and display a research-use caveat.
- **Pulsar catalogue entries are incomplete.** Treat nulls as missing and require explicit manual completion.
- **Flux is frequency-dependent.** Retain measurement frequency, warn on mismatches, and prohibit silent scaling.
- **An embedded catalogue becomes stale or makes `app.js` large.** Store only needed fields, display the snapshot date/version, and define a deliberate update cadence. Revisit a documented CORS-capable API only if freshness outweighs reliability.
- **Browser storage is mistaken for durable/shared storage.** Explain that custom telescope presets are device-local and can be lost when browser data is cleared.
- **Scientific changes break comparison with the old tool.** Lock a small set of golden calculations before refactoring and require review of any added correction factor.
- **The current mobile layout clips content.** Remove hidden vertical overflow and test narrow/short viewports before release.
- **Layout improvements accidentally become a visual redesign.** Freeze screenshots of the current inputs and output treatment before implementation, then use them as regression references while allowing only structural reflow.
- **Shared site files are changed to make the calculator easier to implement.** Treat all files outside `tools/snrcalc/` as read-only and solve calculator-specific needs locally.
