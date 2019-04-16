function ModalsController() {
  window.addEventListener('DOMContentLoaded', () => {
    let container = document.getElementById('modals')

    if (!container) {
      container = document.createElement('div');
      container.classList.add('modals');
      container.classList.add('no-display');
      container.id = 'modals';
      document.body.appendChild(container);
      this.container = container;
    }
    else {
      this.container = container;
    }

    let cover = document.getElementById('modals-cover')

    if (!cover) {
      cover = document.createElement('div');
      cover.classList.add('modals-cover');
      cover.id = 'modals-cover';
      this.cover = cover;
    }
    else {
      this.cover = cover;
    }

    this.modalsOpen = [];
  });
}

ModalsController.prototype.add = function(modal) {
  const element = modal.elements.root;
  this.container.appendChild(element);
  this.container.insertBefore(this.cover, element);
};

ModalsController.prototype.open = function(modal) {
  if (this.container.classList.contains('no-display')) {
    this.container.classList.remove('no-display');
  }

  if (this.modalsOpen.length > 0) {
    this.getLast().elements.root.classList.add('no-display');
  }

  const element = modal.elements.root;
  this.container.insertBefore(this.cover, element);
  element.classList.remove('no-display');
  this.modalsOpen.push(modal);
};

ModalsController.prototype.closeLast = function() {
  if (this.modalsOpen.length == 0) throw new Error('No modals to close');

  this.getLast().elements.root.classList.add('no-display');
  this.modalsOpen.pop();

  if (this.modalsOpen.length > 0) {
    this.getLast().elements.root.classList.remove('no-display');
  }
  else {
    this.container.classList.add('no-display');
  }
};

ModalsController.prototype.getLast = function() {
  return this.modalsOpen[this.modalsOpen.length - 1];
};

module.exports = new ModalsController();