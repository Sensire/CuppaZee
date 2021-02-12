import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Button, Icon, Layout, Text, DrawerItem } from "@ui-kitten/components";
import dayjs from "dayjs";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { FlatList, Image, Platform, Pressable, ScrollView, StyleSheet, View, ViewProps } from "react-native";
import UserActivityOverview from "../components/Activity/Overview";
import ZeeOpsOverview from "../components/ZeeOps/Overview";
import { useClanBookmarks, useUserBookmarks } from "../hooks/useBookmarks";
import useComponentSize from "../hooks/useComponentSize";
import useTitle from "../hooks/useTitle";
import { DashStackParamList } from "../types";

function WheelWrapper({
  onWheel,
  children,
}: React.PropsWithChildren<{ onWheel: (event: React.WheelEvent<HTMLDivElement>) => void }>) {
  if (Platform.OS === "web")
    return (
      <div className="snap-item-center" onWheel={onWheel}>
        <style>
          {".snap-item-center > div > div > div { scroll-snap-align: center !important }"}
        </style>
        {children}
      </div>
    );
  return <>{children}</>;
}

const FlexView = (props: ViewProps) => <View {...props} style={[props.style, { flex: 1 }]} />;

export default function DashboardScreen() {
  const { t } = useTranslation();
  const nav = useNavigation();
  const route = useRoute<RouteProp<DashStackParamList, "Dash">>();
  const scrollRef = React.useRef<FlatList>();
  const scrollSize = React.useRef<{ width: number; height: number }>();
  const position = React.useRef<number>();
  const [users] = useUserBookmarks();
  const [clans] = useClanBookmarks();
  const [touched, setTouched] = React.useState<number[]>([0]);
  const [index, setIndex] = React.useState<number>(0);
  const [size, onLayout] = useComponentSize();
  const width = scrollSize.current?.width ?? size?.width ?? 0;
  useTitle(`☕ Dashboard`);
  return (
    <Layout onLayout={onLayout} style={{ flex: 1 }}>
      <ScrollView
        onContentSizeChange={(w, h) => (scrollSize.current = { width: w, height: h })}
        style={{ flex: 1 }}>
        {users.length > 0 && (
          <View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: -8,
              }}>
              {users.map((i, n) => (
                <Pressable onPress={() => {
                  scrollRef.current?.scrollToOffset({
                    offset:
                      (position.current || 0) + (n - index) * Math.min(600, width),
                  });
                }}>
                  <Image
                    style={
                      index === n
                        ? { height: 32, width: 32, borderRadius: 16, marginHorizontal: 2 }
                        : { height: 16, width: 16, borderRadius: 8, marginHorizontal: 2 }
                    }
                    source={{
                      uri: `https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                        i.user_id
                      ).toString(36)}.png`,
                    }}
                  />
                </Pressable>
              ))}
            </View>
            <WheelWrapper
              onWheel={ev => {
                if ((scrollSize.current?.height || 1) > (size?.height || 0)) return;
                scrollRef.current?.scrollToOffset({
                  offset:
                    (position.current || 0) + (ev.nativeEvent.deltaY / 100) * Math.min(600, width),
                });
              }}>
              <FlatList
                decelerationRate="fast"
                ref={sv => (scrollRef.current = sv || undefined)}
                horizontal={true}
                pagingEnabled={Platform.OS === "web"}
                onScroll={ev => {
                  if (ev.nativeEvent.contentOffset.x !== undefined) {
                    if (position.current === undefined) {
                      scrollRef.current?.scrollToOffset({
                        offset: 0,
                        animated: false,
                      });
                    }
                    position.current = ev.nativeEvent.contentOffset.x;
                    const pos = Math.ceil(
                      (ev.nativeEvent.contentOffset.x - 16) / Math.min(600, width)
                    );
                    setIndex(
                      Math.round((ev.nativeEvent.contentOffset.x - 16) / Math.min(600, width))
                    );
                    if (!touched.includes(pos)) setTouched([...touched, pos]);
                  }
                }}
                scrollEventThrottle={4}
                snapToInterval={Math.min(600, width)}
                snapToAlignment="center"
                showsHorizontalScrollIndicator={false}
                snapToStart={true}
                data={users}
                CellRendererComponent={FlexView}
                renderItem={({ item, index }) => (
                  <View
                    style={{
                      width: Math.min(600, width),
                      padding: 8,
                      zIndex: -index,
                      height: "100%",
                      flex: 1,
                      alignSelf: "center",
                    }}>
                    <Layout level="3" style={[styles.card, { flex: 1 }]}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          padding: 4,
                          justifyContent: "center",
                        }}>
                        <Image
                          style={{ height: 32, width: 32, borderRadius: 16, marginRight: 8 }}
                          source={{
                            uri: `https://munzee.global.ssl.fastly.net/images/avatars/ua${Number(
                              item.user_id
                            ).toString(36)}.png`,
                          }}
                        />
                        <Text category="h5">{item.username}</Text>
                      </View>
                      {touched.includes(index) ? (
                        <>
                          <UserActivityOverview
                            user_id={Number(item?.user_id)}
                            day={dayjs().tz("America/Chicago").format("YYYY-MM-DD")}
                          />
                          <ZeeOpsOverview user_id={Number(item?.user_id)} />
                        </>
                      ) : null}
                    </Layout>
                  </View>
                )}
                ListFooterComponent={<View style={{ width: (width - Math.min(600, width)) / 2 }} />}
                ListHeaderComponent={<View style={{ width: (width - Math.min(600, width)) / 2 }} />}
              />
            </WheelWrapper>
            {width > 600 && (
              <>
                <Button
                  appearance="ghost"
                  accessoryLeft={props => <Icon name="chevron-left" {...props} />}
                  onPress={() => {
                    scrollRef.current?.scrollToOffset({
                      offset: (position.current || 0) - Math.min(600, width),
                    });
                  }}
                  style={{ position: "absolute", left: 0, top: 0, bottom: 0 }}
                />
                <Button
                  appearance="ghost"
                  accessoryLeft={props => <Icon name="chevron-right" {...props} />}
                  onPress={() => {
                    scrollRef.current?.scrollToOffset({
                      offset: (position.current || 0) + Math.min(600, width),
                    });
                  }}
                  style={{ position: "absolute", right: 0, top: 0, bottom: 0 }}
                />
              </>
            )}
          </View>
        )}
        <View style={{ width: Math.min(600, width), alignSelf: "center", padding: 8 }}>
          <Layout level="3" style={[styles.card, { padding: 4 }]}>
            <Text style={{ marginLeft: 4 }} category="h5">
              {t("dashboard:clans")}
            </Text>
            {clans?.map(clan => (
              <DrawerItem
                style={{ backgroundColor: "transparent" }}
                selected={false}
                title={() => (
                  <Text style={{ flex: 1, marginLeft: 4 }} category="s1">
                    {clan.name}
                  </Text>
                )}
                accessoryLeft={() => (
                  <Image
                    source={{
                      uri: `https://munzee.global.ssl.fastly.net/images/clan_logos/${clan.clan_id.toString(
                        36
                      )}.png`,
                    }}
                    style={{
                      height: 32,
                      marginVertical: -4,
                      width: 32,
                      borderRadius: 16,
                      marginHorizontal: 2,
                    }}
                  />
                )}
                onPress={() =>
                  nav.navigate("Clan", {
                    params: { clanid: clan.clan_id.toString() },
                    screen: "Stats",
                  })
                }
              />
            ))}
          </Layout>
        </View>
      </ScrollView>
    </Layout>
  );
}

const styles = StyleSheet.create({
  card: { margin: 4, borderRadius: 4 },
});
