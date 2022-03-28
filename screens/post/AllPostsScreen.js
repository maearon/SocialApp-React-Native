import React, {useState, useCallback, useEffect, useRef} from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Button, Platform, AsyncStorage } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons'

import Card from '../../components/UI/Card';
import Colors from '../../constants/Colors';

import * as postsActions from '../../store/actions/posts';
import * as usersActions from '../../store/actions/users';
import * as chatActions from '../../store/actions/chat';


const AllPostsScreen = (props) => {

    const [isLoading, setIsLoading] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState();

    const refPosts = useRef(null);

    const feed_items = useSelector(state => state.posts.allPosts);
    const loggedUser = useSelector(state => state.auth.user);
    const dispatch = useDispatch();
    const navigation = useNavigation();


    const loadPosts = useCallback(async () => {
        setError(null);
        setIsRefreshing(true);
        try {
            await dispatch(postsActions.fetchPosts());
            await dispatch(usersActions.fetchUsers());
            // await dispatch(chatActions.fetchChatList());

        } catch (err) {
            setError(err.message);
        }
        setIsRefreshing(false);
    }, [dispatch, setIsLoading, setError])

    
    const toggleLikeHandler = async (postId, isLiked) => {
        
        try {
            if(isLiked){
                await dispatch(postsActions.unlikePost(postId))
            } else {
                await dispatch(postsActions.likePost(postId))
            }
        } catch (error) {
            console.log("ERROR ", error)
        }
    }



    // useEffect(() => {
    //     const unsubscribe = props.navigation.addListener('focus', loadPosts);

    //     return () => {
    //         unsubscribe();
    //     };
    // }, [loadPosts])
    useEffect(() => {
        const unsubscribe = navigation.dangerouslyGetParent().addListener('tabPress', e => {
            console.log("TAB PRESSED");
            if(refPosts.current){
                refPosts.current.scrollToIndex({ animated: true, index: 0 });
            }
        });

        return () => {
            unsubscribe();
        };
    }, [])

    useEffect(() => {
        setIsLoading(true);
        loadPosts()
        .then(() => {
            setIsLoading(false);
        });
    }, [dispatch, loadPosts])

    if(error){
        return (
            <View style={styles.centered} >
                <Text>An error occured.{typeof(error)}</Text>
                <Button title="Try again" onPress={loadPosts} color={Colors.primary} />
            </View>
        );
    }


    if(isLoading){
        return (
            <View style={styles.centered} >
                <ActivityIndicator size='large' color={Colors.primary} />
            </View>
        );
    }


    if(!isLoading && feed_items.length === 0){
        return(
            <View style={styles.centered} >
                <Text>No feed_items found. Maybe start adding some!</Text>
            </View>
        );
    }

    const renderItem = (post) => {
        console.log("feed_items - ",post.id);
        return (
            <Card post={feed_items.feed_items[1]} userId={1} toggleLikeHandler={toggleLikeHandler} />
        )
    };

    return (
        <View style={styles.screen} >
            {/* {feed_items.feed_items.length > 0 &&
            <>
                { feed_items.feed_items.map((i, t) => (
                    <>{JSON.stringify(feed_items)}</>
                ))}
            </>
            } */}
            <FlatList
                data={feed_items.feed_items}
                renderItem={renderItem}
                keyExtractor={item => item.id}

                ref={refPosts}
                style={styles.list}
                onRefresh={loadPosts}
                refreshing={isRefreshing}
                

                ItemSeparatorComponent={() => {
                    return (
                        <View style={styles.separator} />
                    )
                }}
                 
            />

        </View>
    );
};



export const screenOptions = (navData) => {
    return{
        headerTitle: 'SocialApp',
        headerRight: () => (
            <Ionicons
                name={Platform.OS === 'android' ? 'md-chatboxes' : 'ios-chatboxes'}
                size = {24}
                color={Platform.OS === 'android' ? '#fff' : Colors.brightBlue}
                style={{  padding: 15, marginRight: 5 }}
                onPress={() => navData.navigation.navigate('ChatList')}
            />
        )
    };
}


const styles = StyleSheet.create({
    screen: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white'
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    list: {
        width: '100%',
    },
    separator: {
        marginTop: 10,
    },

})

export default AllPostsScreen;