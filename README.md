# fathom-react

A node package which makes it easy to use Fathom in React sites.

## Installing

```sh
yarn add fathom-react
```

or

```sh
npm i --save fathom-react
```

## Usage

Wrap your page in the Analytics component:

```js
import Fathom from 'fathom-react';

export default ({ children }) => <Fathom siteId="ABCDEF">{children}</Fathom>;
```

Once Fathom is loaded on a page, it will automatically send pageview events for any page change (including pushState).
You can disable this by setting the `noPageviews` prop.

You can use a custom domain by setting the `customDomain` prop to your domain name.

Any component inside your page can call `useFathom()` to get a fathom object, containing the goal and pageView methods:

```js
import { useFathom } from 'fathom-react';

export default () => {
  const fathom = useFathom();

  return <MyForm onSubmit={() => fathom.goal('UVWXYZ', 10000)}>
}
```
