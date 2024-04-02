import React from 'react';
import {useLocation} from 'react-router-dom';
import styled from '@emotion/styled';

const AppContainer = () => {
    const location = useLocation();
    const wrapper = React.createRef();

    /********************************************************************************************
     * INITIALIZE
     *******************************************************************************************/
    /********************************************************************************************
     * ACTION / EVENT
     *******************************************************************************************/
    /********************************************************************************************
     * RENDER
     *******************************************************************************************/
    return (
        <Wrapper ref={wrapper as React.RefObject<HTMLDivElement>}>
            pathname : {location.pathname}
        </Wrapper>
    );
};

export default AppContainer;

const Wrapper = styled.div`
  height: 100vh;
  position: relative;
`;
