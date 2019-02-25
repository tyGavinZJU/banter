import React, { useContext } from 'react';
import { Box, Flex, Type } from 'blockstack-ui';
import { Hover } from 'react-powerplug';
import Link from 'next/link';

import { AppContext } from '../../common/context/app-context';

export const Logo = ({ width = '28px', height = '28px' }) => (
  <svg
    focusable="false"
    role="img"
    viewBox="0 0 512 512"
    style={{
      width,
      height,
    }}
  >
    <path
      fill="currentColor"
      d="M290.59 192c-20.18 0-106.82 1.98-162.59 85.95V192c0-52.94-43.06-96-96-96-17.67 0-32 14.33-32 32s14.33 32 32 32c17.64 0 32 14.36 32 32v256c0 35.3 28.7 64 64 64h176c8.84 0 16-7.16 16-16v-16c0-17.67-14.33-32-32-32h-32l128-96v144c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16V289.86c-10.29 2.67-20.89 4.54-32 4.54-61.81 0-113.52-44.05-125.41-102.4zM448 96h-64l-64-64v134.4c0 53.02 42.98 96 96 96s96-42.98 96-96V32l-64 64zm-72 80c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16zm80 0c-8.84 0-16-7.16-16-16s7.16-16 16-16 16 7.16 16 16-7.16 16-16 16z"
    />
  </svg>
);

const UserArea = () => {
  const { logout, isSigningIn, username } = useContext(AppContext);

  const color = 'purple';
  const hover = 'white';

  if (isSigningIn) {
    return (
      <Type color={color} fontWeight="bold" display="inline-block">
        Signing In...
      </Type>
    );
  }

  return username ? (
    <Type color={color} fontWeight="bold" display="inline-block">
      <Hover>
        {({ hovered, bind }) => (
          <Link
            href={{
              pathname: '/user',
              query: {
                username,
              },
            }}
            as={`/[::]${username}`}
            passHref
          >
            <Type color={hovered ? hover : color} cursor={hovered ? 'pointer' : 'unset'} {...bind} ml={2}>
              {username}
            </Type>
          </Link>
        )}
      </Hover>

      <Hover>
        {({ hovered, bind }) => (
          <Link href="/settings">
            <Type color={hovered ? hover : color} cursor={hovered ? 'pointer' : 'unset'} {...bind} ml={2}>
              Settings
            </Type>
          </Link>
        )}
      </Hover>
      <Hover>
        {({ hovered, bind }) => (
          <Type
            color={hovered ? hover : color}
            cursor={hovered ? 'pointer' : 'unset'}
            onClick={logout}
            ml={2}
            {...bind}
          >
            Log Out
          </Type>
        )}
      </Hover>
    </Type>
  ) : null;
};

const Nav = ({ ...rest }) => (
  <Flex px={4} py={2} alignItems="center" is="nav" bg="pink" {...rest}>
    <Hover>
      {({ hovered, bind }) => (
        <Box width={1 / 4}>
          <Type is="h1" m={0} fontSize="28px" display="inline-block" {...bind}>
            <Type is="a" href="/" color={hovered ? 'white' : 'purple'} textDecoration="none">
              <Logo />
              <Type display={['none', 'inline-block']} ml={2}>
                Banter
              </Type>
            </Type>
          </Type>
        </Box>
      )}
    </Hover>
    <Box ml="auto">
      <UserArea />
    </Box>
  </Flex>
);
export default Nav;
