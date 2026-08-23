// ============================================================
// Ouchaks OCSDN
// 
// Firebase-powered application engine
// ============================================================

import {
  auth,
  db
} from "./firebase-config.js";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.1.0/firebase-firestore.js";


// ============================================================
// APPLICATION STATE
// ============================================================

let currentUser = null;
let currentUserProfile = null;


// ============================================================
// DOM HELPERS
// ============================================================

const $ = (id) => document.getElementById(id);

function show(id) {
  const element = $(id);
  if (element) element.classList.remove("hidden");
}

function hide(id) {
  const element = $(id);
  if (element) element.classList.add("hidden");
}

function message(text, type = "info") {

  const element = $("loginMessage");

  if (!element) return;

  element.textContent = text;

  element.style.color =
    type === "error"
      ? "#a51d2d"
      : "#164a8a";
}


// ============================================================
// LOGIN
// ============================================================

const loginForm = $("loginForm");

if (loginForm) {

  loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email =
      $("loginEmail")?.value.trim();

    const password =
      $("loginPassword")?.value;

    if (!email || !password) {

      message(
        "Please enter your email and password.",
        "error"
      );

      return;
    }

    try {

      message("Signing in...");

      await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      message("Login successful.");

    } catch (error) {

      console.error(error);

      message(
        getFirebaseErrorMessage(error),
        "error"
      );
    }

  });

}


// ============================================================
// AUTHENTICATION STATE
// ============================================================

onAuthStateChanged(
  auth,
  async (user) => {

    if (!user) {

      currentUser = null;
      currentUserProfile = null;

      hide("application");
      show("loginScreen");

      return;
    }

    currentUser = user;

    try {

      await loadUserProfile();

      hide("loginScreen");
      show("application");

      updateUserInterface();

      await loadDashboard();

    } catch (error) {

      console.error(
        "Profile loading failed:",
        error
      );

      message(
        "Your account could not be loaded.",
        "error"
      );

    }

  }
);


// ============================================================
// USER PROFILE
// ============================================================

async function loadUserProfile() {

  const userRef =
    doc(
      db,
      "users",
      currentUser.uid
    );

  const snapshot =
    await getDoc(userRef);

  if (snapshot.exists()) {

    currentUserProfile =
      snapshot.data();

  } else {

    // New authenticated users start with
    // the most restrictive application role.

    currentUserProfile = {

      uid: currentUser.uid,

      email:
        currentUser.email || "",

      role: "customer",

      status: "active",

      createdAt:
        serverTimestamp()

    };

  }

}


// ============================================================
// USER INTERFACE
// ============================================================

function updateUserInterface() {

  const userElement =
    $("currentUser");

  const roleElement =
    $("currentRole");

  if (userElement) {

    userElement.textContent =
      currentUser.email || "";

  }

  if (roleElement) {

    roleElement.textContent =
      formatRole(
        currentUserProfile?.role ||
        "customer"
      );

  }

}


// ============================================================
// ROLE FORMATTER
// ============================================================

function formatRole(role) {

  const roles = {

    admin: "Administrator",

    staff: "OCSDN Staff",

    customer: "Customer",

    supplier: "Supplier"

  };

  return roles[role] || "Customer";

}


// ============================================================
// LOGOUT
// ============================================================

window.logout = async function () {

  try {

    await signOut(auth);

  } catch (error) {

    console.error(
      "Logout failed:",
      error
    );

  }

};


// ============================================================
// PAGE NAVIGATION
// ============================================================

window.showPage = function(pageName) {

  document
    .querySelectorAll(".page")
    .forEach(page => {

      page.classList.remove("active");

    });

  document
    .querySelectorAll(".nav-btn")
    .forEach(button => {

      button.classList.remove("active");

    });

  const page =
    $(pageName);

  if (page) {

    page.classList.add("active");

  }

  const button =
    document.querySelector(
      `[data-page="${pageName}"]`
    );

  if (button) {

    button.classList.add("active");

  }

};


// ============================================================
// SIDEBAR BUTTONS
// ============================================================

document
  .querySelectorAll(".nav-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        const page =
          button.dataset.page;

        showPage(page);

      }
    );

  });


// ============================================================
// FIRESTORE COLLECTIONS
// ============================================================

const customersCollection =
  collection(db, "customers");

const suppliersCollection =
  collection(db, "suppliers");

const requestsCollection =
  collection(db, "procurementRequests");

const ordersCollection =
  collection(db, "orders");

const auditCollection =
  collection(db, "auditLogs");


// ============================================================
// CUSTOMER REGISTRATION
// ============================================================

const customerForm =
  $("customerForm");

if (customerForm) {

  customerForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      if (!currentUser) {

        alert("Please sign in first.");

        return;

      }

      try {

        const customer = {

          businessName:
            $("customerBusiness").value.trim(),

          owner:
            $("customerOwner").value.trim(),

          mobile:
            $("customerMobile").value.trim(),

          email:
            $("customerEmail").value.trim(),

          tradingArea:
            $("customerArea").value.trim(),

          businessType:
            $("customerType").value,

          membership:
            $("customerMembership").value,

          marketingPreference:
            $("customerMarketing").value,

          createdBy:
            currentUser.uid,

          status:
            "Active",

          createdAt:
            serverTimestamp()

        };


        const result =
          await addDoc(
            customersCollection,
            customer
          );


        await createAuditLog(
          "customer_created",
          result.id
        );


        alert(
          "Customer registered successfully."
        );


        customerForm.reset();

        await loadCustomers();

        await loadDashboard();

      } catch (error) {

        console.error(error);

        alert(
          "Customer registration failed."
        );

      }

    }
  );

}


// ============================================================
// SUPPLIER REGISTRATION
// ============================================================

const supplierForm =
  $("supplierForm");

if (supplierForm) {

  supplierForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      if (!currentUser) {

        alert("Please sign in first.");

        return;

      }

      try {

        const supplier = {

          businessName:
            $("supplierBusiness").value.trim(),

          contact:
            $("supplierContact").value.trim(),

          mobile:
            $("supplierMobile").value.trim(),

          email:
            $("supplierEmail").value.trim(),

          serviceArea:
            $("supplierArea").value.trim(),

          category:
            $("supplierCategory").value,

          status:
            $("supplierStatus").value,

          serviceFee:
            Number(
              $("supplierFee").value || 0
            ),

          createdBy:
            currentUser.uid,

          createdAt:
            serverTimestamp()

        };


        const result =
          await addDoc(
            suppliersCollection,
            supplier
          );


        await createAuditLog(
          "supplier_created",
          result.id
        );


        alert(
          "Supplier registered successfully."
        );


        supplierForm.reset();

        await loadSuppliers();

        await loadDashboard();

      } catch (error) {

        console.error(error);

        alert(
          "Supplier registration failed."
        );

      }

    }
  );

}


// ============================================================
// PROCUREMENT REQUEST
// ============================================================

const requestForm =
  $("requestForm");

if (requestForm) {

  requestForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      if (!currentUser) {

        alert("Please sign in first.");

        return;

      }

      try {

        const request = {

          customerId:
            $("requestCustomer").value,

          product:
            $("requestProduct").value.trim(),

          quantity:
            $("requestQuantity").value.trim(),

          requiredDate:
            $("requestDate").value,

          delivery:
            $("requestDelivery").value,

          budget:
            Number(
              $("requestBudget").value || 0
            ),

          notes:
            $("requestNotes").value.trim(),

          status:
            "Submitted",

          createdBy:
            currentUser.uid,

          createdAt:
            serverTimestamp()

        };


        const result =
          await addDoc(
            requestsCollection,
            request
          );


        await createAuditLog(
          "procurement_request_created",
          result.id
        );


        alert(
          "Procurement request submitted."
        );


        requestForm.reset();

        await loadRequests();

      } catch (error) {

        console.error(error);

        alert(
          "Procurement request failed."
        );

      }

    }
  );

}


// ============================================================
// ORDER CREATION
// ============================================================

const orderForm =
  $("orderForm");

if (orderForm) {

  orderForm.addEventListener(
    "submit",
    async event => {

      event.preventDefault();

      if (!currentUser) {

        alert("Please sign in first.");

        return;

      }

      try {

        const orderValue =
          Number(
            $("orderValue").value || 0
          );

        const deliveryFee =
          Number(
            $("orderDelivery").value || 0
          );

        const serviceFee =
          Number(
            $("orderFee").value || 0
          );

        const commissionRate =
          Number(
            $("orderCommission").value || 0
          );

        const commission =
          orderValue *
          commissionRate /
          100;


        const order = {

          customerId:
            $("orderCustomer").value,

          supplierId:
            $("orderSupplier").value,

          product:
            $("orderProduct").value.trim(),

          orderValue,

          deliveryFee,

          serviceFee,

          commissionRate,

          commission,

          ouchaksRevenue:
            serviceFee + commission,

          status:
            $("orderStatus").value,

          createdBy:
            currentUser.uid,

          createdAt:
            serverTimestamp()

        };


        const result =
          await addDoc(
            ordersCollection,
            order
          );


        await createAuditLog(
          "order_created",
          result.id
        );


        alert(
          "Order created successfully."
        );


        orderForm.reset();

        await loadOrders();

        await loadDashboard();

      } catch (error) {

        console.error(error);

        alert(
          "Order creation failed."
        );

      }

    }
  );

}


// ============================================================
// AUDIT LOG
// ============================================================

async function createAuditLog(
  action,
  recordId
) {

  if (!currentUser) return;

  try {

    await addDoc(
      auditCollection,
      {

        action,

        recordId,

        userId:
          currentUser.uid,

        userEmail:
          currentUser.email || "",

        timestamp:
          serverTimestamp()

      }
    );

  } catch (error) {

    console.error(
      "Audit logging failed:",
      error
    );

  }

}


// ============================================================
// LOAD CUSTOMERS
// ============================================================

async function loadCustomers() {

  const table =
    $("customerTable");

  if (!table) return;

  table.innerHTML = "";

  try {

    const snapshot =
      await getDocs(
        customersCollection
      );

    snapshot.forEach(
      item => {

        const data =
          item.data();

        const row =
          document.createElement("tr");

        row.innerHTML = `

          <td>${escapeHTML(item.id)}</td>

          <td>
            ${escapeHTML(
              data.businessName || ""
            )}
          </td>

          <td>
            ${escapeHTML(
              data.owner || ""
            )}
          </td>

          <td>
            ${escapeHTML(
              data.tradingArea || ""
            )}
          </td>

          <td>
            ${escapeHTML(
              data.businessType || ""
            )}
          </td>

          <td>
            <span class="badge green">
              ${escapeHTML(
                data.status || "Active"
              )}
            </span>
          </td>

        `;

        table.appendChild(row);

      }
    );

    updateCustomerSelects();

  } catch (error) {

    console.error(error);

  }

}


// ============================================================
// CUSTOMER SELECTS
// ============================================================

async function updateCustomerSelects() {

  const selects = [

    $("requestCustomer"),

    $("orderCustomer")

  ];

  const snapshot =
    await getDocs(
      customersCollection
    );

  selects.forEach(select => {

    if (!select) return;

    select.innerHTML =
      '<option value="">Select customer</option>';

    snapshot.forEach(item => {

      const data =
        item.data();

      const option =
        document.createElement("option");

      option.value =
        item.id;

      option.textContent =
        data.businessName || item.id;

      select.appendChild(option);

    });

  });

}


// ============================================================
// LOAD SUPPLIERS
// ============================================================

async function loadSuppliers() {

  const table =
    $("supplierTable");

  if (!table) return;

  table.innerHTML = "";

  try {

    const snapshot =
      await getDocs(
        suppliersCollection
      );

    snapshot.forEach(
      item => {

        const data =
          item.data();

        const row =
          document.createElement("tr");

        row.innerHTML = `

          <td>
            ${escapeHTML(item.id)}
          </td>

          <td>
            ${escapeHTML(
              data.businessName || ""
            )}
          </td>

          <td>
            ${escapeHTML(
              data.contact || ""
            )}
          </td>

          <td>
            ${escapeHTML(
              data.serviceArea || ""
            )}
          </td>

          <td>
            ${escapeHTML(
              data.category || ""
            )}
          </td>

          <td>
            ${escapeHTML(
              data.status || ""
            )}
          </td>

          <td>
            R${Number(
              data.serviceFee || 0
            ).toFixed(2)}
          </td>

        `;

        table.appendChild(row);

      }
    );

    updateSupplierSelects();

  } catch (error) {

    console.error(error);

  }

}


// ============================================================
// SUPPLIER SELECTS
// ============================================================

async function updateSupplierSelects() {

  const select =
    $("orderSupplier");

  if (!select) return;

  select.innerHTML =
    '<option value="">Select supplier</option>';

  const snapshot =
    await getDocs(
      suppliersCollection
    );

  snapshot.forEach(item => {

    const data =
      item.data();

    const option =
      document.createElement("option");

    option.value =
      item.id;

    option.textContent =
      data.businessName || item.id;

    select.appendChild(option);

  });

}


// ============================================================
// LOAD REQUESTS
// ============================================================

async function loadRequests() {

  const table =
    $("requestTable");

  if (!table) return;

  table.innerHTML = "";

  const snapshot =
    await getDocs(
      requestsCollection
    );

  snapshot.forEach(item => {

    const data =
      item.data();

    const row =
      document.createElement("tr");

    row.innerHTML = `

      <td>
        ${escapeHTML(item.id)}
      </td>

      <td>
        ${escapeHTML(
          data.customerId || ""
        )}
      </td>

      <td>
        ${escapeHTML(
          data.product || ""
        )}
      </td>

      <td>
        ${escapeHTML(
          data.requiredDate || ""
        )}
      </td>

      <td>
        <span class="badge blue">
          ${escapeHTML(
            data.status || "Submitted"
          )}
        </span>
      </td>

    `;

    table.appendChild(row);

  });

}


// ============================================================
// LOAD ORDERS
// ============================================================

async function loadOrders() {

  const table =
    $("orderTable");

  if (!table) return;

  table.innerHTML = "";

  const snapshot =
    await getDocs(
      ordersCollection
    );

  snapshot.forEach(item => {

    const data =
      item.data();

    const row =
      document.createElement("tr");

    row.innerHTML = `

      <td>
        ${escapeHTML(item.id)}
      </td>

      <td>
        ${escapeHTML(
          data.customerId || ""
        )}
      </td>

      <td>
        ${escapeHTML(
          data.supplierId || ""
        )}
      </td>

      <td>
        R${Number(
          data.orderValue || 0
        ).toFixed(2)}
      </td>

      <td>
        R${Number(
          data.ouchaksRevenue || 0
        ).toFixed(2)}
      </td>

      <td>
        <span class="badge blue">
          ${escapeHTML(
            data.status || ""
          )}
        </s
