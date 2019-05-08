const {createElementFromHTML} = require('csp-app/libs/utilities');

function template() {
  const html = /*html*/`
    <div class="form ce-form">
      <div class="field field-oneline field-title clearfix">
        <div class="field-label"><label for="ce-form-title">Title</label></div>
        <div class="field-input"><input type="text" id="ce-form-title" /></div>
      </div>

      <div class="field field-oneline field-desc clearfix">
        <div class="field-label"><label for="ce-form-desc">Description</label></div>
        <div class="field-input"><textarea id="ce-form-desc"></textarea></div>
      </div>

      <div class="field field-oneline field-date clearfix">
        <div class="field-label"><label for="ce-form-date">Date</label></div>
        <div class="field-input">
          <input type="text" id="ce-form-date" placeholder="dd/mm/yyyy" />
          <button class="btn-no-style"><i class="i i-calendar"></i></button>
        </div>
      </div>

      <div class="field field-oneline field-time clearfix">
        <div class="field-label"><label>Time</label></div>
        <div class="field-input">
          <input type="text" placeholder="hh:mm" class="from" />
          <span>-</span>
          <input type="text" placeholder="hh:mm" class="to" />
        </div>
      </div>

      <div class="field field-participants">
        <div class="field-label">Participants <button class="btn-primary-outlined"><i class="i i-plus"></i>Select participants</button></div>
        <div class="field-input"></div>
        <div class="field-alert no-display">
          These cannot participate: <span class="participants-list"></span>
        </div>
      </div>

      <div class="field field-oneline field-link clearfix">
        <div class="field-label"><label for="ce-form-link">Link</label></div>
        <div class="field-input"><input type="text" id="ce-form-link" /></div>
      </div>

      <div class="field field-oneline field-type clearfix">
        <div class="field-label"><label for="ce-form-link">Type</label></div>
        <div class="field-input">
          <select></select>
        </div>
      </div>

      <div class="field field-oneline field-project clearfix">
        <div class="field-label"><label for="ce-form-project">Project</label></div>
        <div class="field-input">
        <select></select>
        </div>
      </div>

      <div class="field field-importance">
        <div class="field-label">Importance mark</div>
        <div class="field-input">
          <div>
            <input type="radio" name="importance" value="none" id="imp-none" />
            <label for="imp-none">None</label>
          </div>
          
          <div>
            <input type="radio" name="importance" value="important" id="imp-important" />
            <label for="imp-important">Important</label>
          </div>

          <div>
            <input type="radio" name="importance" value="desirable" id="imp-desirable" />
            <label for="imp-desirable">Desirable</label>
          </div>
        </div>
      </div>

      <div class="field field-docs">
        <div class="field-label">Documents <button class="btn-primary-outlined"><i class="i i-plus"></i>Attach document</button></div>
        <div class="field-input"></div>
      </div>
    </div>
  `;

  const element = createElementFromHTML(html);
  const title = element.querySelector('.field-title input');
  const desc = element.querySelector('.field-desc textarea');
  const date = element.querySelector('.field-date input');
  const from = element.querySelector('.field-time .from');
  const to = element.querySelector('.field-time .to');
  const addParticipantBtn = element.querySelector('.field-participants button');
  const addParticipantPlace = element.querySelector('.field-participants .field-input');
  const link = element.querySelector('.field-link input');
  const typeSelect = element.querySelector('.field-type select');
  const projectSelect = element.querySelector('.field-project select');
  const impRadioNone = element.querySelector('#imp-none');
  const impRadioImportant = element.querySelector('#imp-important');
  const impRadioDesirable = element.querySelector('#imp-desirable');
  const addDocBtn = element.querySelector('.field-docs button');
  const addDocPlace = element.querySelector('.field-docs .field-input');

  return {
    root: element,
    title,
    desc,
    date,
    time: {
      from,
      to
    },
    participants: {
      btn: addParticipantBtn,
      place: addParticipantPlace,
      alert: {
        root: element.querySelector('.field-participants .field-alert'),
        place: element.querySelector('.field-participants .participants-list')
      }
    },
    link,
    type: typeSelect,
    project: projectSelect,
    importance: {
      none: impRadioNone,
      important: impRadioImportant,
      desirable: impRadioDesirable
    },
    docs: {
      btn: addDocBtn,
      place: addDocPlace
    }
  };
}

module.exports = template;