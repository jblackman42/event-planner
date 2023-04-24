class CustomForms extends HTMLElement {
  constructor() {
    super();

    this.formGUID = this.getAttribute('formguid');
    this.requestURL = 'http://localhost:3000'

    if (!this.formGUID) return console.error('form guid not provided');

    this.getFormData();
  }

  getFormData = async () => {
    this.form = await axios({
      method: 'get',
      url: `${this.requestURL}/api/widgets/group-register?Form_GUID=${this.formGUID}`
    })
      .then(response => response.data)

    this.update();
  }

  update = () => {
    console.log(this.form)
  }
}

customElements.define('phc-custom-form', CustomForms);