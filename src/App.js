// Imports and instance connecting to Optimizely
import React, { useState } from 'react';
import {
  createInstance,
  OptimizelyProvider,
  useDecision,
} from '@optimizely/react-sdk';

const optimizelyClient = createInstance({ sdkKey: process.env.REACT_APP_SDK_KEY });
/////////////////////////////////////////////////

/////////////////////////////////////////////////
// TODO: Feature Flag test v1
/////////////////////////////////////////////////
function Pre(props) {
  return <pre style={{ margin: 0 }}>{props.children}</pre>
}

function isClientValid() {
  return optimizelyClient.getOptimizelyConfig() !== null;
}

const userIds = [];
while (userIds.length < 10) {
  userIds.push((Math.floor(Math.random() * 999999) + 100000).toString())
}

function App() {
  const [hasOnFlag, setHasOnFlag] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [isClientReady, setIsClientReady] = useState(null);

  optimizelyClient.onReady().then(() => {
    setIsDone(true);
    isClientValid() && setIsClientReady(true);
  });

  let projectId = '{project_id}';
  if (isClientValid()) {
    const datafile = JSON.parse(optimizelyClient.getOptimizelyConfig().getDatafile());
    projectId = datafile.projectId;
  }

  const isReturningUserCookieMock = Math.random() < 0.5;

  return (
    <OptimizelyProvider
        optimizely={optimizelyClient}
        user={{ id: 'default_user', attributes: { returningUser: isReturningUserCookieMock } }}
      >
        {isClientReady &&
          <>
            {userIds.map((userId) => <Decision key={userId} userId={userId} setHasOnFlag={setHasOnFlag} />)}
            <br />
            {!hasOnFlag && <FlagsOffMessage projectId={projectId} />}
          </>
        }
        {isDone && !isClientReady && <Pre>Optimizely client invalid. Verify in Settings -&gt; Environments that you used the primary environment's SDK key</Pre>}
    </OptimizelyProvider>
  )
}

function FlagsOffMessage({ projectId }) {
  const navLink = `https://app.optimizely.com/v2/projects/${projectId}/settings/implementation`;
  return (
    <div>
      <Pre>Flag was off for everyone. Some reasons could include:</Pre>
      <Pre>1. Your sample size of visitors was too small. Rerun, or increase the iterations in the FOR loop</Pre>
      <Pre>2. By default you have 2 keys for 2 project environments (dev/prod). Verify in Settings&gt;Environments that you used the right key for the environment where your flag is toggled to ON.</Pre>
      <Pre>Check your key at <a href={navLink}>{navLink}</a></Pre>
      <br />
    </div>
	);
}

function Decision({ userId, setHasOnFlag }) {
  // Define which flag we are using, and in this case we are also sending our "userId"
  const [decision, clientReady] = useDecision('product_sort', {}, {overrideUserId: userId});

  if (!clientReady) {
    return ''
  }

  const variationKey = decision.variationKey;
  console.log(decision);

  if (variationKey === null) {
    console.log(' decision error: ', decision['reasons']);
  }

  if (decision.enabled) {
    setTimeout(() => setHasOnFlag(true));
  }

  const sortMethod = decision.variables['sort_method'];

  return (
    <Pre>
      {`\nFlag ${decision.enabled ? 'on' : 'off'}. User number ${userId} saw flag variation: ${variationKey} and got products sorted by: ${sortMethod} config variable as part of flag rule: ${decision.ruleKey}`}
    </Pre>
  );
}

// End of Feature flag v1 demo
//////////////////////////////

/////////////////////////////////////////////////
// TODO: A/B test v1
/////////////////////////////////////////////////

// function Pre(props) {
//   return <pre style={{ margin: 0 }}>{props.children}</pre>
// }

// function isClientValid() {
//   return optimizelyClient.getOptimizelyConfig() !== null;
// }

// const userIds = [];
// while (userIds.length < 4) {
//   userIds.push((Math.floor(Math.random() * 999999) + 100000).toString())
// }

// let userMessages = userIds.reduce((result, userId) => ({ ...result, [userId]: []}), {});
// const donePromise = new Promise((resolve) => {
//   setTimeout(() => {
//     optimizelyClient.onReady().then(() => {
//       if (isClientValid()) {
//         userIds.forEach((userId) => {
//           const question = `Pretend that user ${userId} made a purchase?`;
//           const trackEvent = window.confirm(question);

//           trackEvent && optimizelyClient.track('purchase', userId);
//           const message = trackEvent
//                             ? "Optimizely recorded a purchase in experiment results for user " + userId
//                             : "Optimizely didn't record a purchase in experiment results for user " + userId;
//           userMessages[userId].push(`${question} ${trackEvent ? 'Y' : 'N'}`, message);
//         });
//       }
//       resolve();
//     });
//   }, 500);
// });

// function App() {
//   const [hasOnFlag, setHasOnFlag] = useState(false);
//   const [isDone, setIsDone] = useState(false);
//   const [isClientReady, setIsClientReady] = useState(null);

//   donePromise.then(() => setIsDone(true));
//   optimizelyClient.onReady().then(() => { isClientValid() && setIsClientReady(true) });

//   let projectId = '{project_id}';
//   if (isClientValid()) {
//     const datafile = JSON.parse(optimizelyClient.getOptimizelyConfig().getDatafile());
//     projectId = datafile.projectId;
//   }

//   const reportsNavLink = `https://app.optimizely.com/v2/projects/${projectId}/reports`;

//   return (
//     <OptimizelyProvider
//         optimizely={optimizelyClient}
//         user={{ id: 'default_user' }}
//       >
//         <pre>Welcome to our Quickstart Guide!</pre>
//         {isClientReady && <>
//             { userIds.map((userId) => (
//               <>
//                 <Decision key={userId} userId={userId} setHasOnFlag={setHasOnFlag} />
//                 { userMessages[userId].map((message) => <Pre>{message}</Pre>)}
//                 <br />
//               </>
//             )) }
//             {!hasOnFlag && <FlagsOffMessage projectId={projectId} />}
//             {isDone && (
//               <>
//                 <Pre>Done with your mocked A/B test.</Pre>
//                 <Pre>Check out your report at <a href={reportsNavLink}>{reportsNavLink}</a></Pre>
//                 <Pre>Be sure to select the environment that corresponds to your SDK key</Pre>
//               </>
//             )}
//           </>
//         }
//         {isDone && !isClientReady && <Pre>Optimizely client invalid. Verify in Settings -&gt; Environments that you used the primary environment's SDK key</Pre>}
//     </OptimizelyProvider>
//   )
// }

// function FlagsOffMessage({ projectId }) {
//   const navLink = `https://app.optimizely.com/v2/projects/${projectId}/settings/implementation`;
//   return (
//     <div>
//       <Pre>Flag was off for everyone. Some reasons could include:</Pre>
//       <Pre>1. Your sample size of visitors was too small. Rerun, or increase the iterations in the FOR loop</Pre>
//       <Pre>2. By default you have 2 keys for 2 project environments (dev/prod). Verify in Settings&gt;Environments that you used the right key for the environment where your flag is toggled to ON.</Pre>
//       <Pre>Check your key at <a href={navLink}>{navLink}</a></Pre>
//       <br />
//     </div>
// 	);
// }

// function Decision({ userId, setHasOnFlag }) {
//   const [decision, clientReady] = useDecision('product_sort', {}, {overrideUserId: userId});

//   if (!clientReady) {
//     return ''
//   }

//   const variationKey = decision.variationKey;

//   if (variationKey === null) {
//     console.log(' decision error: ', decision['reasons']);
//   }

//   if (decision.enabled) {
//     setTimeout(() => setHasOnFlag(true));
//   }
  
//   const sortMethod = decision.variables['sort_method'];

//   return (
//     <Pre>
//       {`Flag ${decision.enabled ? 'on' : 'off'}. User number ${userId} saw flag variation: ${variationKey} and got products sorted by: ${sortMethod} config variable as part of flag rule: ${decision.ruleKey}`}
//     </Pre>
//   );
// }

// End of first A/B test
////////////////////////

// TODO: Second Flag Feature
// import React, { useState } from 'react';

// function Pre(props) {
//   return <pre style={{ margin: 0 }}>{props.children}</pre>
// }

// function isClientValid() {
//   return optimizelyClient.getOptimizelyConfig() !== null;
// }

// const userIds = [];
// while (userIds.length < 4) {
//   userIds.push((Math.floor(Math.random() * 999999) + 100000).toString())
// }

// function App() {
//   const [isDone, setIsDone] = useState(false);
//   const [isClientReady, setIsClientReady] = useState(null);

//   optimizelyClient.onReady().then(() => {
//     setIsDone(true);
//     isClientValid() && setIsClientReady(true);
//   });

//   return (
//     <OptimizelyProvider
//         optimizely={optimizelyClient}
//         user={{ id: 'default_user' }}
//       >
//         <pre>Welcome to our Quickstart Guide!</pre>
//         {isClientReady &&
//           <>
//             {userIds.map((userId) => <Decision key={userId} userId={userId} />)}
//             <br />
//           </>
//         }
//         {isDone && !isClientReady && <Pre>Optimizely client invalid. Verify in Settings -&gt; Environments that you used the primary environment's SDK key</Pre>}
//     </OptimizelyProvider>
//   )
// }

// function Decision({ userId }) {
//   const [decision, clientReady] = useDecision('form', {}, {overrideUserId: userId});

//   if (!clientReady) {
//     return ''
//   }
//   console.log(decision);

//   const variationKey = decision.variationKey;

//   if (variationKey === null) {
//     console.log(' decision error: ', decision['reasons']);
//   }

//   const value1 = decision.variables.value1;
//   const value2 = decision.variables.value2;

//   return (
//     <Pre>
//       <form action="/action_page.php">
//         <label for="fname">value 1 {value1 ? "is not" : "is"} optional:</label>
//         <input type="text" id="value1" name="value1" required={value1} />
//         <label for="lname">value 2 {value2 ? "is not" : "is"} optional:</label>
//         <input type="text" id="value2" name="value2" required={value2} />
//         <input type="submit" value="Submit"/>
//       </form>
//     </Pre>
//   );
// }

// End of second feature flag
////////////////////////////

///////////////////////
// TODO: SECOND AB TEST

// function Pre(props) {
//   return <pre style={{ margin: 0 }}>{props.children}</pre>;
// }

// function isClientValid() {
//   return optimizelyClient.getOptimizelyConfig() !== null;
// }

// const userIds = [];
// while (userIds.length < 1) {
//   userIds.push((Math.floor(Math.random() * 999999) + 100000).toString());
// }

// let userMessages = userIds.reduce(
//   (result, userId) => ({ ...result, [userId]: [] }),
//   {}
// );

// function App() {
//   const [isClientReady, setIsClientReady] = useState(null);

//   optimizelyClient.onReady().then(() => {
//     isClientValid() && setIsClientReady(true);
//   });

//   return (
//     <OptimizelyProvider
//       optimizely={optimizelyClient}
//       user={{ id: "default_user" }}
//     >
//       <pre>Welcome to our Quickstart Guide!</pre>
//       {isClientReady && (
//         <>
//           {userIds.map((userId) => (
//             <>
//               <Decision key={userId} userId={userId} />
//               {userMessages[userId].map((message) => (
//                 <Pre>{message}</Pre>
//               ))}
//               <br />
//             </>
//           ))}
//         </>
//       )}
//     </OptimizelyProvider>
//   );
// }

// const handleSubmit = (value1, value2, userId) => e => {
//   e.preventDefault();

//   (new Promise((resolve) => {
//     setTimeout(() => {
//       optimizelyClient.onReady().then(() => {
//         console.log(value1 + " | " + value2);
//         if (value1 !== "" && value2 !== "") {
//           optimizelyClient.track("finished_form", userId);
//         } else {
//           optimizelyClient.track('unfinished_form', userId);
//         }
//       })
//       resolve();
//     }, 500);
//   }));
// }

// function Decision({ userId }) {
//   const [decision, clientReady] = useDecision(
//     "form",
//     {},
//     { overrideUserId: userId }
//   );
//   const [value1, setValue1] = useState("");
//   const [value2, setValue2] = useState("");

//   console.log(decision);
//   console.log(decision.variables);
//   console.log(decision.variationKey);

//   if (!clientReady) {
//     return "";
//   }

//   const value1Required = decision.variables.value1;
//   const value2Required = decision.variables.value2;

//   return (
//     <Pre>
//       <form
//         onSubmit={handleSubmit(value1, value2, userId)}
//       >
//         <label for="fname">
//           value 1 {value1Required ? "required" : "optional"}:
//         </label>
//         <input
//           type="text"
//           id="value1"
//           value={value1}
//           name="value1"
//           required={value1Required}
//           onChange={(e) => setValue1(e.target.value)}
//         />

//         <label for="lname">
//           value 2 {value2Required ? "required" : "optional"}:
//         </label>
//         <input
//           type="text"
//           id="value2"
//           value={value2}
//           name="value2"
//           required={value2Required}
//           onChange={(e) => setValue2(e.target.value)}
//         />

//         <input type="submit" value="Submit" />
//       </form>
//     </Pre>
//   );
// }

////////////////////////
// Export Component
export default App;
