import React, { Fragment, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getPosts } from '../../actions/post';
import Spinner from '../layout/Spinner';
import { connect } from 'react-redux';

const Posts = ({ getPosts, post: { posts, loading } }) => {
    useEffect(() => {
        getPosts();
    }, [getPosts]);
    return (
        <Fragment>
            <Spinner></Spinner>
        </Fragment>
    );
};

Posts.propTypes = {
    getPosts: PropTypes.func.isRequired,
    post: PropTypes.object.isRequired,
};

const mapStateToPrps = (state) => ({
    post: state.post,
});
export default connect(mapStateToPrps, { getPosts })(Posts);
