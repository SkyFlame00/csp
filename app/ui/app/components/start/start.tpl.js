function template(data) {
  return /*html*/`
    <div class="cmp_start">
      <div class="wrapper">
        <div class="container">
          <div class="logo-block">
            <h1>Welcome to Consulting Services Platform</h1>
          </div>
          
          <a data-route="/">Home</a>
          <a data-route="/dashboard">Dashboard</a>

          <div class="start-tabs"></div>
        </div>
      </div>
    </div>
  `;
}

module.exports = template;


`
<div class="main-actions">
  <button id="login-switch">Log in</button>
  <button id="signup-switch">Sign up</button>
</div>

<div class="login" id="login">
  <div class="header"><h2>Log in</h2></div>
  <div class="login-form form">
    
  </div>
</div>

<div class="signup" id="signup">
  <div class="tab-actions clearfix">
    <button id="client-switch">Sign up as client</button>
    <button id="exec-switch">Sign up as executor</button>
  </div>

  <div class="signup-form" id="signup-form">
    <div class="client-form form" id="client-form"></div>
    <div class="exec-form form" id="exec-form"></div>
  </div>
</div>
`